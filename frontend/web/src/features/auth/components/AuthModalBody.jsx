import {
    validateDepartment,
    validateEmail,
    validateName,
    validatePassword,
    validatePhone
} from '@shared/schemas/common'
import { ForgotForm } from '@/features/auth/components/ForgotForm'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ResetForm } from '@/features/auth/components/ResetForm'
import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm'

const resolveFormErrors = (form, error, isCredentialError) => {
    const isPhoneError = error === 'Invalid phone number format' || Boolean(error?.toLowerCase().includes('phone'))
    let emailError = form.email ? validateEmail(form.email) : ''
    let passwordError = form.password ? validatePassword(form.password) : ''
    if (isCredentialError) {
        emailError = error
        passwordError = error
    } else if (!isPhoneError && error) {
        emailError = error
    }

    return {
        firstnameError: form.firstname ? validateName(form.firstname) : '',
        lastnameError: form.lastname ? validateName(form.lastname) : '',
        emailError,
        phoneError: (isPhoneError ? error : '') || (form.phone ? validatePhone(form.phone) : ''),
        passwordError,
        departmentError: form.department ? validateDepartment(form.department) : ''
    }
}

export const AuthModalBody = ({
    tab,
    form,
    error,
    successMessage,
    showPass,
    validLogin,
    validRegister,
    validForgot,
    validReset,
    actions,
    onFieldChange,
    onToggleShowPass,
    onSwitchTab
}) => {
    const isCredentialError = error === 'Email or password is incorrect'
    const { firstnameError, lastnameError, emailError, phoneError, passwordError, departmentError } = resolveFormErrors(
        form,
        error,
        isCredentialError
    )

    if (tab === 'login') {
        return (
            <LoginForm
                form={form}
                emailError={emailError}
                passwordError={passwordError}
                showPass={showPass}
                validLogin={validLogin}
                isPending={actions.loginPending}
                onFieldChange={onFieldChange}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleLogin}
            />
        )
    }

    if (tab === 'register') {
        return (
            <RegisterForm
                form={form}
                firstnameError={firstnameError}
                lastnameError={lastnameError}
                emailError={emailError}
                phoneError={phoneError}
                departmentError={departmentError}
                passwordError={passwordError}
                showPass={showPass}
                validRegister={validRegister}
                isPending={actions.registerPending}
                onFieldChange={onFieldChange}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleRegister}
            />
        )
    }

    if (tab === 'forgot') {
        return (
            <ForgotForm
                form={form}
                error={emailError}
                successMessage={successMessage}
                validForgot={validForgot}
                isPending={actions.forgotPending}
                onFieldChange={onFieldChange}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleForgot}
            />
        )
    }

    if (tab === 'reset') {
        return (
            <ResetForm
                form={form}
                error={error}
                showPass={showPass}
                validReset={validReset}
                isPending={actions.resetPending}
                onFieldChange={onFieldChange}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleReset}
            />
        )
    }

    if (tab === 'verify') {
        return <VerifyOtpForm email={form.email} onSwitchTab={onSwitchTab} />
    }

    return null
}
