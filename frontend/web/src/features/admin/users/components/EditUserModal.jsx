import { useCallback, useEffect } from 'react'
import { useSetState } from '@shared/hooks/useSetState'
import { Select } from '@/components/ui/Select'
import { useUpdateUser } from '@/api/users/update-user'
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
import { toTitleCase } from '@shared/util/name'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { ModalShell } from '@/features/admin/users/components/UserModalShell'
import { FormField as Field } from '@/components/ui/form/FormField'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { EDITABLE_ROLES } from '@shared/constants'

const noop = () => null

const INITIAL_FORM_STATE = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'borrower',
    department: '',
    password: '',
    showPassword: false,
    error: ''
})

const useEditUserFormFields = (setForm) => {
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

    const handleRoleChange = useCallback(
        (value) => {
            setForm({ role: value, error: '' })
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

    return {
        handleFirstnameChange,
        handleLastnameChange,
        handleEmailChange,
        handlePhoneChange,
        handleRoleChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword
    }
}

const extractFormError = (error) => {
    const errors = error?.errors || {}
    return errors.email?.[0] || errors.phone?.[0] || error?.message || 'Failed to update user'
}

const buildUpdatePayload = (form, isBorrower) => ({
    firstname: form.firstname.trim(),
    lastname: form.lastname.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: form.role,
    department: isBorrower ? form.department : null,
    ...(form.password ? { password: form.password } : {})
})

const useEditUserForm = (user, isOpen, onClose, onSuccess) => {
    const [form, setForm] = useSetState(INITIAL_FORM_STATE)

    useEffect(() => {
        if (isOpen && user) {
            setForm({
                firstname: toTitleCase(user.firstname || ''),
                lastname: toTitleCase(user.lastname || ''),
                email: user.email || '',
                phone: formatPhone(user.phone || ''),
                role: user.role || 'borrower',
                department: user.department || '',
                password: '',
                showPassword: false,
                error: ''
            })
        }
    }, [isOpen, user, setForm])

    const handleClose = useCallback(() => {
        setForm(INITIAL_FORM_STATE)
        onClose()
    }, [onClose, setForm])

    const fields = useEditUserFormFields(setForm)
    const updateUserMutation = useUpdateUser()

    const isBorrower = form.role === 'borrower'
    const isValid = Boolean(
        isValidName(form.firstname) &&
        isValidName(form.lastname) &&
        isValidEmail(form.email) &&
        isValidPhone(form.phone) &&
        (!isBorrower || form.department) &&
        (!form.password || isValidPassword(form.password))
    )

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            if (!isValid || updateUserMutation.isPending || !user?.id) {
                return
            }
            try {
                await updateUserMutation.mutateAsync({
                    userId: user.id,
                    data: buildUpdatePayload(form, isBorrower)
                })
                setForm(INITIAL_FORM_STATE)
                onSuccess()
                onClose()
            } catch (error) {
                setForm({ error: extractFormError(error) })
            }
        },
        [form, isBorrower, isValid, onClose, onSuccess, setForm, updateUserMutation, user]
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
        isPending: updateUserMutation.isPending,
        handleClose,
        ...fields,
        handleSubmit
    }
}

export const EditUserModal = ({ isOpen = false, onClose = noop, user = null, onSuccess = noop }) => {
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
        handleRoleChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword,
        handleSubmit
    } = useEditUserForm(user, isOpen, onClose, onSuccess)

    if (!isOpen || !user) {
        return null
    }

    return (
        <ModalShell
            title="Edit User"
            subtitle="Update this user's account details."
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitLabel="Update"
            isPending={isPending}
            disabled={!isValid}>
            <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                    autoComplete="off"
                    label="First Name"
                    name="edit-user-firstname"
                    maxLength={MAX_NAME_LENGTH}
                    value={form.firstname}
                    onChange={handleFirstnameChange}
                    error={errors.firstname}
                />
                <TextInput
                    autoComplete="off"
                    label="Last Name"
                    name="edit-user-lastname"
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
                name="edit-user-email"
                value={form.email}
                onChange={handleEmailChange}
                error={errors.email}
            />
            <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                    autoComplete="off"
                    label="Phone"
                    type="tel"
                    maxLength={20}
                    name="edit-user-phone"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    error={errors.phone}
                />
                <Field label="Role">
                    <Select
                        value={form.role}
                        onChange={handleRoleChange}
                        options={EDITABLE_ROLES}
                        panelClass="right-0 left-auto! w-full bg-white shadow-lg"
                        hoverClass="hover:bg-gray-100"
                        selectedClass="bg-border-focus"
                        className="w-full bg-white border border-gray-300 h-10 px-3 gap-2 text-[14px] text-text"
                    />
                    <div className="h-4 mt-1" />
                </Field>
            </div>
            {isBorrower && (
                <DepartmentSelect value={form.department} onChange={handleDepartmentChange} error={errors.department} />
            )}
            <PasswordInput
                maxLength={64}
                autoComplete="new-password"
                name="edit-user-password"
                value={form.password}
                onChange={handlePasswordChange}
                showPassword={form.showPassword}
                onToggleShow={handleTogglePassword}
                error={errors.password}
                required={false}
            />
        </ModalShell>
    )
}
