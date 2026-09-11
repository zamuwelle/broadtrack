import { useCallback } from 'react'
import { useSetState } from '@shared/hooks/useSetState'
import { Select } from '@/components/ui/Select'
import { useUpdateUser } from '@/api/users/update-user'
import { MAX_NAME_LENGTH, isValidEmail, isValidName, isValidPassword } from '@shared/schemas/common'
import { DepartmentSelect } from '@/features/admin/users/components/DepartmentSelect'
import { UserModalShell } from '@/features/admin/users/components/UserModalShell'
import { getUserFormErrors } from '@/features/admin/users/getUserFormErrors'
import { FormField as Field } from '@/components/ui/form/FormField'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { EDITABLE_ROLES } from '@shared/constants'

const noop = () => null

const getInitialFormState = (user) => ({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    role: user?.role || 'borrower',
    department: user?.department || '',
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
        handleRoleChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword
    }
}

const extractFormError = (error) => {
    const errors = error?.errors || {}
    return errors.email?.[0] || error?.message || 'Failed to update user'
}

const buildUpdatePayload = (form, isBorrower) => ({
    firstname: form.firstname.trim(),
    lastname: form.lastname.trim(),
    email: form.email.trim(),
    role: form.role,
    department: isBorrower ? form.department : null,
    ...(form.password ? { password: form.password } : {})
})

const checkEditUserValid = (form, isBorrower) =>
    Boolean(
        isValidName(form.firstname) &&
        isValidName(form.lastname) &&
        isValidEmail(form.email) &&
        (!isBorrower || form.department) &&
        (!form.password || isValidPassword(form.password))
    )

const useEditUserForm = (user, onClose, onSuccess) => {
    const [form, setForm] = useSetState(() => getInitialFormState(user))

    const handleClose = useCallback(() => {
        setForm(getInitialFormState(user))
        onClose()
    }, [onClose, setForm, user])

    const fields = useEditUserFormFields(setForm)
    const updateUserMutation = useUpdateUser()

    const isBorrower = form.role === 'borrower'
    const isValid = checkEditUserValid(form, isBorrower)

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
                setForm(getInitialFormState(user))
                onSuccess({ firstname: form.firstname.trim(), lastname: form.lastname.trim() })
                onClose()
            } catch (error) {
                setForm({ error: extractFormError(error) })
            }
        },
        [form, isBorrower, isValid, onClose, onSuccess, setForm, updateUserMutation, user]
    )

    const errors = getUserFormErrors(form, isBorrower)

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
        handleRoleChange,
        handleDepartmentChange,
        handlePasswordChange,
        handleTogglePassword,
        handleSubmit
    } = useEditUserForm(user, onClose, onSuccess)

    if (!isOpen || !user) {
        return null
    }

    return (
        <UserModalShell
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
        </UserModalShell>
    )
}
