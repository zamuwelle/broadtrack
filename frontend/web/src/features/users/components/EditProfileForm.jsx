import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/lib/auth'
import { useUpdateForm } from '@/hooks/actions/useUpdateForm'
import { formatPhone } from '@shared/util/phone'
import { MAX_NAME_LENGTH, validateDepartment, validateName, validatePhone } from '@shared/schemas/common'
import { updateProfile } from '@/api/users/update-profile'
import { uploadProfilePicture } from '@/api/users/upload-picture'
import { ProfileInputField } from '@/features/users/components/ProfileInputField'
import { ProfileActionButtons } from '@/features/users/components/ProfileActionButtons'
import { ROLES } from '@shared/constants'

const fields = Object.freeze([
    {
        label: 'First Name',
        icon: 'person',
        key: 'firstname',
        type: 'text',
        validate: validateName,
        maxLength: MAX_NAME_LENGTH
    },
    {
        label: 'Last Name',
        icon: 'person',
        key: 'lastname',
        type: 'text',
        validate: validateName,
        maxLength: MAX_NAME_LENGTH
    },
    {
        label: 'Email',
        icon: 'email',
        key: 'email',
        type: 'email',
        maxLength: 255,
        readOnly: true
    },
    {
        label: 'Phone',
        icon: 'phone',
        key: 'phone',
        type: 'tel',
        maxLength: 20,
        validate: validatePhone
    },
    {
        label: 'Department',
        placeholder: 'Select Department',
        icon: 'department',
        key: 'department',
        type: 'text',
        validate: validateDepartment
    }
])

const noop = () => null

export const EditProfileForm = ({ onClose = noop, onUpdated = noop, pendingPicture = null, card = false }) => {
    const { data: user } = useUser()
    const queryClient = useQueryClient()
    const profileFields = useMemo(() => {
        const resolvedFields = []
        for (const field of fields) {
            resolvedFields.push(
                field.key === 'department'
                    ? {
                          ...field,
                          validate: (value) => (user?.role === ROLES.BORROWER || value ? validateDepartment(value) : '')
                      }
                    : field
            )
        }
        return resolvedFields
    }, [user?.role])

    const initialValues = useMemo(
        () => ({
            firstname: user?.firstname ?? '',
            lastname: user?.lastname ?? '',
            email: user?.email ?? '',
            phone: formatPhone(user?.phone ?? ''),
            department: user?.department ?? ''
        }),
        [user]
    )

    const updateHandler = useCallback(
        async (changed) => {
            let updated = null
            if (pendingPicture) {
                const response = await uploadProfilePicture(pendingPicture)
                updated = response?.data ?? response
            }
            if (Object.keys(changed).length > 0) {
                const response = await updateProfile(changed)
                updated = response?.data ?? response
            }
            if (updated) {
                queryClient.setQueryData(['me'], (old) => (old ? { ...old, ...updated } : updated))
                queryClient.invalidateQueries({ queryKey: ['user'] })
                queryClient.invalidateQueries({ queryKey: ['users'] })
            }
        },
        [pendingPicture, queryClient]
    )

    const { values, errors, canSubmit, isPending, setFieldValue, setError, handleUpdate } = useUpdateForm({
        fields: profileFields,
        initialValues,
        extraDirty: Boolean(pendingPicture),
        update: updateHandler,
        onSuccess: onUpdated,
        onClose
    })

    const formKey = user?.id ?? 'loading'

    return (
        <form
            key={formKey}
            onSubmit={handleUpdate}
            className={`flex flex-col font-['Poppins'] ${card ? 'w-full gap-6' : 'w-full h-full bg-surface items-center'}`}>
            <div
                className={
                    card
                        ? 'flex w-full flex-col gap-2.5 rounded-lg bg-zinc-100/40 p-4 outline outline-1 outline-offset-[-1px] outline-slate-300'
                        : 'flex flex-col gap-3'
                }>
                {profileFields.map((field) => (
                    <ProfileInputField
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? ''}
                        error={errors[field.key] ?? ''}
                        card={card}
                        onValueChange={setFieldValue}
                        onErrorChange={setError}
                    />
                ))}
            </div>
            <div
                className={`flex items-end ${card ? 'w-full justify-end flex-col gap-2' : 'mt-[18px] self-end flex-col gap-2 w-[401px]'}`}>
                {errors.submit ? <span className="text-[12px] text-red-500">{errors.submit}</span> : null}
                <ProfileActionButtons card={card} canSubmit={canSubmit} isPending={isPending} onClose={onClose} />
            </div>
        </form>
    )
}
