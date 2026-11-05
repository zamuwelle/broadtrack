import { useCallback } from 'react'
import {
    VALIDATION_MESSAGES,
    validateDepartment,
    validateEmail,
    validateName,
    validatePassword
} from '@shared/schemas/common'
import { ForgotForm } from '@/features/auth/components/ForgotForm'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ResetForm } from '@/features/auth/components/ResetForm'
import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm'

const resolveFormErrors = (form, error, isCredentialError) => {
    let emailError = form.email ? validateEmail(form.email) : ''
    let passwordError = form.password ? validatePassword(form.password) : ''
    if (isCredentialError) {
        emailError = error
        passwordError = error
    } else if (error) {
        emailError = error
    }

    return {
        firstnameError: form.firstname ? validateName(form.firstname) : '',
        lastnameError: form.lastname ? validateName(form.lastname) : '',
        emailError,
        passwordError,
        departmentError: form.department ? validateDepartment(form.department) : ''
    }
}

export const AuthModalBody = ({
    tab,
    form,
    error,
    isServerError,
    showPass,
    actions,
    onClearError,
    showToast,
    onToggleShowPass,
    onSwitchTab
}) => {
    const isCredentialError = error === 'Email or password is incorrect'
    const { firstnameError, lastnameError, emailError, passwordError, departmentError } = resolveFormErrors(
        form,
        isServerError ? '' : error,
        isCredentialError
    )
    const handleInvalid = useCallback(
        (invalidErrors, values) => {
            if (
                Object.entries(invalidErrors).some(
                    ([name, field]) => field.message === VALIDATION_MESSAGES.REQUIRED || values?.[name] === ''
                )
            ) {
                showToast(VALIDATION_MESSAGES.MISSING_FIELDS, 'warning')
            }
        },
        [showToast]
    )

    if (tab === 'login') {
        return (
            <LoginForm
                form={form}
                emailError={emailError}
                passwordError={passwordError}
                showPass={showPass}
                isPending={actions.loginPending}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleLogin}
                onInvalid={handleInvalid}
                onClearError={onClearError}
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
                departmentError={departmentError}
                passwordError={passwordError}
                showPass={showPass}
                isPending={actions.registerPending}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleRegister}
                onInvalid={handleInvalid}
                onClearError={onClearError}
            />
        )
    }

    if (tab === 'forgot') {
        return (
            <ForgotForm
                form={form}
                error={emailError}
                isPending={actions.forgotPending}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleForgot}
                onInvalid={handleInvalid}
                onClearError={onClearError}
            />
        )
    }

    if (tab === 'reset') {
        return (
            <ResetForm
                form={form}
                error={isServerError ? '' : error}
                showPass={showPass}
                isPending={actions.resetPending}
                onToggleShowPass={onToggleShowPass}
                onSwitchTab={onSwitchTab}
                onSubmit={actions.handleReset}
                onInvalid={handleInvalid}
                onClearError={onClearError}
            />
        )
    }

    if (tab === 'verify') {
        return <VerifyOtpForm email={form.email} onSwitchTab={onSwitchTab} />
    }

    return null
}
