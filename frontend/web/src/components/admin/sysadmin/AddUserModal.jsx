import { useCallback, useEffect } from 'react'
import { useSend } from '@/hooks/actions/useSend'
import { useSetState } from '@shared/hooks/useSetState'
import { userService } from '@/api'
import {
    MAX_NAME_LENGTH,
    formatPhone,
    getDepartmentError,
    getEmailError,
    getFirstnameError,
    getLastnameError,
    getPasswordError,
    getPhoneError,
    isValidEmail,
    isValidName,
    isValidPassword,
    isValidPhone
} from '@shared/util/validation'
import { DepartmentSelect } from '@/components/admin/sysadmin/DepartmentSelect'
import { ModalShell } from '@/components/admin/sysadmin/UserModalShell'
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

    const addSend = useSend({
        send: (userData) => userService.create({ ...userData, role }),
        onSuccess: () => {
            setForm(initialFormState)
            onSuccess()
            onClose()
        },
        onError: (error = {}) => {
            const errors = error.errors || {}
            const emailErrorMsg = errors.email ? errors.email[0] : null
            const phoneErrorMsg = errors.phone ? errors.phone[0] : null
            setForm({
                error: emailErrorMsg || phoneErrorMsg || error.message || 'Failed to create user'
            })
        }
    })

    const isValid = Boolean(
        isValidName(form.firstname) &&
        isValidName(form.lastname) &&
        isValidEmail(form.email) &&
        isValidPhone(form.phone) &&
        (!isBorrower || form.department) &&
        isValidPassword(form.password)
    )

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault()
            if (!isValid || addSend.isPending) {
                return
            }
            addSend.send({
                firstname: form.firstname.trim(),
                lastname: form.lastname.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                department: isBorrower ? form.department : null,
                password: form.password
            })
        },
        [addSend, form, isBorrower, isValid]
    )

    const errors = {
        firstname: form.firstname ? getFirstnameError(form.firstname) : '',
        lastname: form.lastname ? getLastnameError(form.lastname) : '',
        email: form.error || getEmailError(form.email),
        phone: form.phone ? getPhoneError(form.phone) : '',
        password: form.password ? getPasswordError(form.password) : '',
        department: isBorrower && form.department ? getDepartmentError(form.department) : ''
    }

    return {
        form,
        errors,
        isBorrower,
        isValid,
        isPending: addSend.isPending,
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
