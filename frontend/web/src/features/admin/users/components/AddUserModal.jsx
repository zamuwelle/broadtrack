import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateUser } from '@/features/users/api/create-user'
import { useToast } from '@/hooks/ui/useToast'
import { MAX_NAME_LENGTH } from '@shared/schemas/common'
import { addUserSchema } from '@shared/schemas/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { UserModalShell } from '@/features/admin/users/components/UserModalShell'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { FormError } from '@/components/ui/form/FormError'

const noop = () => null

const getDefaultValues = (role) => ({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    password: '',
    role
})

export const AddUserModal = ({
    isOpen = false,
    onClose = noop,
    onSuccess = noop,
    userRole,
    role = userRole || 'borrower'
}) => {
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { show: showToast } = useToast()
    const createUserMutation = useCreateUser()
    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        setError: setFieldError,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(addUserSchema),
        mode: 'onChange',
        defaultValues: getDefaultValues(role)
    })
    const [firstname, lastname, email, department, password] = watch([
        'firstname',
        'lastname',
        'email',
        'department',
        'password'
    ])
    const firstChange = useRef(true)
    const isBorrower = role === 'borrower'

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        setError('')
    }, [firstname, lastname, email, department, password])

    const handleTogglePassword = useCallback(() => setShowPassword((visible) => !visible), [])

    const handleClose = useCallback(() => {
        reset(getDefaultValues(role))
        setError('')
        setShowPassword(false)
        onClose()
    }, [onClose, reset, role])

    const handleFormSubmit = useCallback(
        async (values) => {
            if (createUserMutation.isPending) {
                return
            }
            try {
                await createUserMutation.mutateAsync({
                    firstname: values.firstname.trim(),
                    lastname: values.lastname.trim(),
                    email: values.email.trim(),
                    department: isBorrower ? values.department : null,
                    password: values.password,
                    role
                })
                reset(getDefaultValues(role))
                setError('')
                onSuccess(`${isBorrower ? 'Borrower' : 'Admin'} added successfully!`)
                onClose()
            } catch (submitError) {
                const serverErrors = submitError?.errors || {}
                const message = serverErrors.email?.[0] || submitError?.message || 'Failed to create user'
                if (serverErrors.email?.[0]) {
                    setFieldError('email', { type: 'server', message })
                } else {
                    setError(message)
                }
                showToast(message, 'danger')
            }
        },
        [createUserMutation, isBorrower, onClose, onSuccess, reset, role, setFieldError, showToast]
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

    if (!isOpen) {
        return null
    }

    const title = isBorrower ? 'Add Borrower' : 'Add Admin'
    const subtitle = isBorrower
        ? 'Create a new BroadTrack borrower account.'
        : 'Create a new BroadTrack administrator account.'

    return (
        <UserModalShell
            title={title}
            subtitle={subtitle}
            onClose={handleClose}
            onSubmit={handleFormSubmitEvent}
            submitLabel="Add"
            isPending={createUserMutation.isPending}
            disabled={!isValid}>
            <FormError message={error} />
            <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                    autoComplete="off"
                    label="First Name"
                    name="new-user-firstname"
                    maxLength={MAX_NAME_LENGTH}
                    error={errors.firstname?.message}
                    {...register('firstname')}
                />
                <TextInput
                    autoComplete="off"
                    label="Last Name"
                    name="new-user-lastname"
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
                name="new-user-email"
                error={errors.email?.message}
                {...register('email')}
            />
            {isBorrower ? <Controller name="department" control={control} render={renderDepartment} /> : null}
            <PasswordInput
                showPassword={showPassword}
                onToggleShow={handleTogglePassword}
                maxLength={64}
                autoComplete="new-password"
                name="new-user-password"
                error={errors.password?.message}
                {...register('password')}
            />
        </UserModalShell>
    )
}
