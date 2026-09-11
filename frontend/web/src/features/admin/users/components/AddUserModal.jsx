import { useCallback } from 'react'
import { useSetState } from '@shared/hooks/useSetState'
import { useCreateUser } from '@/api/users/create-user'
import { MAX_NAME_LENGTH, isValidEmail, isValidName, isValidPassword } from '@shared/schemas/common'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { UserModalShell } from '@/features/admin/users/components/UserModalShell'
import { getUserFormErrors } from '@/features/admin/users/getUserFormErrors'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'

const noop = () => null

const initialFormState = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    password: '',
    showPassword: false,
    error: ''
})

const useAddUserForm = (role, onClose, onSuccess) => {
    const [form, setForm] = useSetState(initialFormState)
    const isBorrower = role === 'borrower'

    const handleClose = useCallback(() => {
        setForm(initialFormState)
        onClose()
    }, [onClose, setForm])

    const handleFirstnameChange = useCallback(
        (e) => {
            setForm({ firstname: e.target.value, error: '' })
        },
        [setForm]
    )

    const handleLastnameChange = useCallback(
        (e) => {
            setForm({ lastname: e.target.value, error: '' })
        },
        [setForm]
    )

    const handleEmailChange = useCallback(
        (e) => {
            setForm({ email: e.target.value, error: '' })
        },
        [setForm]
    )

    const handleDepartmentChange = useCallback(
        (value) => {
            setForm({ department: value, error: '' })
        },
        [setForm]
    )

    const handlePasswordChange = useCallback(
        (e) => {
            setForm({ password: e.target.value, error: '' })
        },
        [setForm]
    )

    const handleTogglePassword = useCallback(() => {
        setForm((prev) => ({ showPassword: !prev.showPassword }))
    }, [setForm])

    const createUserMutation = useCreateUser()

    const isValid = Boolean(
        isValidName(form.firstname) &&
        isValidName(form.lastname) &&
        isValidEmail(form.email) &&
        (!isBorrower || form.department) &&
        isValidPassword(form.password)
    )

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            if (!isValid || createUserMutation.isPending) {
                return
            }
            try {
                await createUserMutation.mutateAsync({
                    firstname: form.firstname.trim(),
                    lastname: form.lastname.trim(),
                    email: form.email.trim(),
                    department: isBorrower ? form.department : null,
                    password: form.password,
                    role
                })
                setForm(initialFormState)
                onSuccess(`${isBorrower ? 'Borrower' : 'Admin'} added successfully!`)
                onClose()
            } catch (error) {
                const errors = error?.errors || {}
                const emailErrorMsg = errors.email ? errors.email[0] : null
                setForm({
                    error: emailErrorMsg || error?.message || 'Failed to create user'
                })
            }
        },
        [createUserMutation, form, isBorrower, isValid, onClose, onSuccess, role, setForm]
    )

    const errors = getUserFormErrors(form, isBorrower)

    return {
        form,
        errors,
        isBorrower,
        isValid,
        isPending: createUserMutation.isPending,
        handleClose,
        handleFirstnameChange,
        handleLastnameChange,
        handleEmailChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword,
        handleSubmit
    }
}

export const AddUserModal = ({
    isOpen = false,
    onClose = noop,
    onSuccess = noop,
    userRole,
    role = userRole || 'borrower'
}) => {
    const {
        form,
        errors,
        isBorrower,
        isValid,
        isPending,
        handleClose,
        handleFirstnameChange,
        handleLastnameChange,
        handleEmailChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword,
        handleSubmit
    } = useAddUserForm(role, onClose, onSuccess)

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
            onSubmit={handleSubmit}
            submitLabel="Add"
            isPending={isPending}
            disabled={!isValid}>
            <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                    autoComplete="off"
                    label="First Name"
                    name="new-user-firstname"
                    maxLength={MAX_NAME_LENGTH}
                    value={form.firstname}
                    onChange={handleFirstnameChange}
                    error={errors.firstname}
                />
                <TextInput
                    autoComplete="off"
                    label="Last Name"
                    name="new-user-lastname"
                    maxLength={MAX_NAME_LENGTH}
                    value={form.lastname}
                    onChange={handleLastnameChange}
                    error={errors.lastname}
                />
            </div>
            <TextInput
                autoComplete="off"
                label="Email Address"
                type="email"
                maxLength={255}
                name="new-user-email"
                value={form.email}
                onChange={handleEmailChange}
                error={errors.email}
            />
            {isBorrower && (
                <DepartmentSelect value={form.department} onChange={handleDepartmentChange} error={errors.department} />
            )}
            <PasswordInput
                maxLength={64}
                autoComplete="new-password"
                name="new-user-password"
                value={form.password}
                onChange={handlePasswordChange}
                showPassword={form.showPassword}
                onToggleShow={handleTogglePassword}
                error={errors.password}
            />
        </UserModalShell>
    )
}
