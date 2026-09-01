import { useCallback, useEffect } from 'react'
import { useSetState } from '@shared/hooks/useSetState'
import { useCreateUser } from '@/api/users/create-user'
import { formatPhone } from '@shared/util/phone'
import {
    MAX_NAME_LENGTH,
    isValidEmail,
    isValidName,
    isValidPassword,
    isValidPhone,
    validateDepartment,
    validateEmail,
    validateName,
    validatePassword,
    validatePhone
} from '@shared/schemas/common'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { ModalShell } from '@/features/admin/users/components/UserModalShell'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'

const noop = () => null

const initialFormState = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    showPassword: false,
    error: ''
})

const useAddUserForm = (role, isOpen, onClose, onSuccess) => {
    const [form, setForm] = useSetState(initialFormState)
    const isBorrower = role === 'borrower'

    useEffect(() => {
        if (isOpen) {
            setForm(initialFormState)
        }
    }, [isOpen, setForm])

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

    const handlePhoneChange = useCallback(
        (e) => {
            setForm({ phone: formatPhone(e.target.value), error: '' })
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
        isValidPhone(form.phone) &&
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
                    phone: form.phone.trim(),
                    department: isBorrower ? form.department : null,
                    password: form.password,
                    role
                })
                setForm(initialFormState)
                onSuccess()
                onClose()
            } catch (error) {
                const errors = error?.errors || {}
                const emailErrorMsg = errors.email ? errors.email[0] : null
                const phoneErrorMsg = errors.phone ? errors.phone[0] : null
                setForm({
                    error: emailErrorMsg || phoneErrorMsg || error?.message || 'Failed to create user'
                })
            }
        },
        [createUserMutation, form, isBorrower, isValid, onClose, onSuccess, role, setForm]
    )

    const errors = {
        firstname: form.firstname ? validateName(form.firstname) : '',
        lastname: form.lastname ? validateName(form.lastname) : '',
        email: form.error || (form.email ? validateEmail(form.email) : ''),
        phone: form.phone ? validatePhone(form.phone) : '',
        password: form.password ? validatePassword(form.password) : '',
        department: isBorrower && form.department ? validateDepartment(form.department) : ''
    }

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
        handlePhoneChange,
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
        handlePhoneChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword,
        handleSubmit
    } = useAddUserForm(role, isOpen, onClose, onSuccess)

    if (!isOpen) {
        return null
    }

    const title = isBorrower ? 'Add Borrower' : 'Add Admin'
    const subtitle = isBorrower
        ? 'Create a new BroadTrack borrower account.'
        : 'Create a new BroadTrack administrator account.'

    return (
        <ModalShell
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
            <TextInput
                autoComplete="off"
                label="Phone"
                type="tel"
                maxLength={20}
                name="new-user-phone"
                value={form.phone}
                onChange={handlePhoneChange}
                error={errors.phone}
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
        </ModalShell>
    )
}
