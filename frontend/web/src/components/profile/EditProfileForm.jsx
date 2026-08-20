import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/queries/useUser'
import { useUpdateForm } from '@/hooks/actions/useUpdateForm'
import {
    MAX_NAME_LENGTH,
    formatPhone,
    getDepartmentError,
    getFirstnameError,
    getLastnameError,
    getPhoneError
} from '@shared/util/validation'
import { toTitleCase } from '@shared/util/name'
import { authService } from '@/api'
import { ProfileInputField } from '@/components/profile/ProfileInputField'
import { ProfileActionButtons } from '@/components/profile/ProfileActionButtons'

const fields = Object.freeze([
    {
        label: 'First Name',
        icon: 'person',
        key: 'firstname',
        type: 'text',
        validate: getFirstnameError,
        titleCase: true,
        maxLength: MAX_NAME_LENGTH
    },
    {
        label: 'Last Name',
        icon: 'person',
        key: 'lastname',
        type: 'text',
        validate: getLastnameError,
        titleCase: true,
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
        validate: getPhoneError
    },
    {
        label: 'Department',
        placeholder: 'Select Department',
        icon: 'department',
        key: 'department',
        type: 'text',
        validate: getDepartmentError
    }
])

const noop = () => null

export const EditProfileForm = ({ onClose = noop, onUpdated = noop, pendingPicture = null, card = false }) => {
    const { data: user } = useUser()
    const queryClient = useQueryClient()

    const initial = useMemo(
        () => ({
            firstname: toTitleCase(user?.firstname ?? ''),
            lastname: toTitleCase(user?.lastname ?? ''),
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
                const { data } = await authService.uploadPicture(pendingPicture)
                updated = data
            }
            if (Object.keys(changed).length > 0) {
                const { data } = await authService.update(changed)
                updated = data
            }
            if (updated) {
                queryClient.setQueryData(['me'], (old) => (old ? { ...old, ...updated } : updated))
            }
        },
        [pendingPicture, queryClient]
    )

    const { values, errors, valid, isPending, set, setError, handleUpdate } = useUpdateForm({
        fields,
        initial,
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
                {fields.map((field) => (
                    <ProfileInputField
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? ''}
                        error={errors[field.key] ?? ''}
                        card={card}
                        onValueChange={set}
                        onErrorChange={setError}
                    />
                ))}
            </div>
            <div
                className={`flex items-end ${card ? 'w-full justify-end flex-col gap-2' : 'mt-[18px] self-end flex-col gap-2 w-[401px]'}`}>
                {errors.submit ? <span className="text-[12px] text-red-500">{errors.submit}</span> : null}
                <ProfileActionButtons card={card} valid={valid} isPending={isPending} onClose={onClose} />
            </div>
        </form>
    )
}
