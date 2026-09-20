import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Select } from '@/components/ui/Select'
import { useUpdateUser } from '@/features/users/api/update-user'
import { MAX_NAME_LENGTH } from '@shared/schemas/common'
import { editUserSchema } from '@shared/schemas/users'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { UserModalShell } from '@/features/admin/users/components/UserModalShell'
import { FormField as Field } from '@/components/ui/form/FormField'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { EDITABLE_ROLES } from '@shared/constants'

const noop = () => null

const getDefaultValues = (user) => ({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    role: user?.role || 'borrower',
    department: user?.department || '',
    password: ''
})

export const EditUserModal = ({ isOpen = false, onClose = noop, user = null, onSuccess = noop }) => {
    const [error, setError] = useState('')
    const updateUserMutation = useUpdateUser()
    const {
        control,
        register,
        watch,
        reset,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(editUserSchema),
        mode: 'onChange',
        defaultValues: getDefaultValues(user)
    })
    const role = watch('role')
    const watchedValues = watch(['firstname', 'lastname', 'email', 'role', 'department', 'password'])
    const firstChange = useRef(true)
    const isBorrower = role === 'borrower'

    useEffect(() => {
        reset(getDefaultValues(user))
        setError('')
    }, [reset, user])

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        setError('')
    }, [watchedValues])

    const handleClose = useCallback(() => {
        reset(getDefaultValues(user))
        setError('')
        onClose()
    }, [onClose, reset, user])

    const handleFormSubmit = useCallback(
        async (values) => {
            if (updateUserMutation.isPending || !user?.id) {
                return
            }
            try {
                await updateUserMutation.mutateAsync({
                    userId: user.id,
                    data: {
                        firstname: values.firstname.trim(),
                        lastname: values.lastname.trim(),
                        email: values.email.trim(),
                        role: values.role,
                        department: isBorrower ? values.department : null,
                        ...(values.password ? { password: values.password } : {})
                    }
                })
                reset(getDefaultValues(user))
                setError('')
                onSuccess({ firstname: values.firstname.trim(), lastname: values.lastname.trim() })
                onClose()
            } catch (submitError) {
                const serverErrors = submitError?.errors || {}
                setError(serverErrors.email?.[0] || submitError?.message || 'Failed to update user')
            }
        },
        [isBorrower, onClose, onSuccess, reset, updateUserMutation, user]
    )
    const renderRole = useCallback(
        ({ field }) => {
            const handleRoleChange = field.onChange
            return (
                <Select
                    {...field}
                    onChange={handleRoleChange}
                    options={EDITABLE_ROLES}
                    panelClass="right-0 left-auto! w-full bg-white shadow-lg"
                    hoverClass="hover:bg-gray-100"
                    selectedClass="bg-border-focus"
                    className="w-full bg-white border border-gray-300 h-10 px-3 gap-2 text-[14px] text-text"
                />
            )
        },
        []
    )
    const renderDepartment = useCallback(
        ({ field }) => {
            const handleDepartmentChange = field.onChange
            return (
                <DepartmentSelect
                    value={field.value}
                    onChange={handleDepartmentChange}
                    error={errors.department?.message}
                />
            )
        },
        [errors.department?.message]
    )
    const handleFormSubmitEvent = useCallback(
        (event) => handleSubmit(handleFormSubmit)(event),
        [handleFormSubmit, handleSubmit]
    )

    if (!isOpen || !user) {
        return null
    }

    return (
        <UserModalShell
            title="Edit User"
            subtitle="Update this user's account details."
            onClose={handleClose}
            onSubmit={handleFormSubmitEvent}
            submitLabel="Update"
            isPending={updateUserMutation.isPending}
            disabled={!isValid}>
            {error ? <p className="text-[13px] text-red-500">{error}</p> : null}
            <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                    autoComplete="off"
                    label="First Name"
                    name="edit-user-firstname"
                    maxLength={MAX_NAME_LENGTH}
                    error={errors.firstname?.message}
                    {...register('firstname')}
                />
                <TextInput
                    autoComplete="off"
                    label="Last Name"
                    name="edit-user-lastname"
                    maxLength={MAX_NAME_LENGTH}
                    error={errors.lastname?.message}
                    {...register('lastname')}
                />
            </div>
            <TextInput
                autoComplete="off"
                label="Email Address"
                type="email"
                maxLength={255}
                name="edit-user-email"
                error={errors.email?.message}
                {...register('email')}
            />
            <Field label="Role">
                <Controller
                    name="role"
                    control={control}
                    render={renderRole}
                />
                <div className="h-4 mt-1" />
            </Field>
            {isBorrower ? (
                <Controller
                    name="department"
                    control={control}
                    render={renderDepartment}
                />
            ) : null}
            <PasswordInput
                maxLength={64}
                autoComplete="new-password"
                name="edit-user-password"
                error={errors.password?.message}
                {...register('password')}
                required={false}
            />
        </UserModalShell>
    )
}
