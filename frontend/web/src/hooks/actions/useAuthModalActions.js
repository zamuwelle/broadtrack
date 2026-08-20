import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { VALIDATION_MESSAGES, isValidEmail } from '@shared/util/validation'
import { useSend } from '@/hooks/actions/useSend'
import { authService } from '@/api'

const hasRegisterMissing = (form) => {
    const fn = (form.firstname || '').trim()
    const ln = (form.lastname || '').trim()
    const em = (form.email || '').trim()
    const ph = (form.phone || '').trim()
    const dp = (form.department || '').trim()
    const pw = form.password || ''
    return !fn || !ln || !em || !ph || !dp || !pw
}

const useAuthLoginHandlers = ({
    form,
    validLogin,
    onLoginSuccess,
    onClose,
    updateAuthState,
    showToast,
    initialFormState
}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const saveAuth = useCallback(
        ({ data = {} }) => {
            if (data.token) {
                globalThis.localStorage.setItem('auth_token', data.token)
            }
            if (data.user) {
                queryClient.setQueryData(['me'], data.user)
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess(data.user)
                }
            }
            updateAuthState({
                showPass: false,
                error: '',
                successMessage: '',
                form: { ...initialFormState }
            })
            onClose()
            const user = data.user || {}
            const { role } = user
            navigate(role === 'admin' || role === 'sysadmin' ? '/admin' : '/borrow', {
                replace: true
            })
        },
        [queryClient, onLoginSuccess, updateAuthState, initialFormState, onClose, navigate]
    )

    const loginSend = useSend({
        send: authService.login,
        onSuccess: saveAuth,
        onError: useCallback(
            (loginError = {}) => {
                if (loginError.status === 403) {
                    showToast(loginError.message)
                } else {
                    updateAuthState({
                        error: loginError.message || 'Email or password is incorrect'
                    })
                }
            },
            [showToast, updateAuthState]
        )
    })

    const handleLogin = useCallback(
        (event) => {
            event.preventDefault()
            const trimmedEmail = (form.email || '').trim()
            if (trimmedEmail && !isValidEmail(form.email)) {
                showToast(VALIDATION_MESSAGES.LA_VERDAD_EMAIL_PROMPT, 'danger')
                return
            }
            if (!trimmedEmail || !form.password) {
                showToast(VALIDATION_MESSAGES.MISSING_FIELDS, 'warning')
                return
            }
            if (validLogin && !loginSend.isPending) {
                loginSend.send({ email: form.email, password: form.password })
            }
        },
        [form.email, form.password, validLogin, loginSend, showToast]
    )

    return {
        loginPending: loginSend.isPending,
        handleLogin
    }
}

const useAuthRegisterHandlers = ({ form, validRegister, updateAuthState, showToast, initialFormState }) => {
    const showCheckInbox = useCallback(() => {
        updateAuthState({
            tab: 'login',
            showPass: false,
            error: '',
            successMessage: '',
            form: { ...initialFormState }
        })
        showToast('Account created! Check your inbox to verify.')
    }, [updateAuthState, initialFormState, showToast])

    const registerSend = useSend({
        send: authService.register,
        onSuccess: showCheckInbox,
        onError: useCallback(
            (registerError = {}) => {
                const errors = registerError.errors || {}
                const emailMsg = errors.email ? errors.email[0] : null
                const phoneMsg = errors.phone ? errors.phone[0] : null
                updateAuthState({
                    error: emailMsg || phoneMsg || registerError.message || 'Registration failed'
                })
            },
            [updateAuthState]
        )
    })

    const handleRegister = useCallback(
        (event) => {
            event.preventDefault()
            const trimmedEmail = (form.email || '').trim()
            if (trimmedEmail && !isValidEmail(form.email)) {
                showToast(VALIDATION_MESSAGES.LA_VERDAD_EMAIL_PROMPT, 'danger')
                return
            }
            if (hasRegisterMissing(form)) {
                showToast(VALIDATION_MESSAGES.MISSING_FIELDS, 'warning')
                return
            }
            if (validRegister && !registerSend.isPending) {
                registerSend.send(form)
            }
        },
        [form, validRegister, registerSend, showToast]
    )

    return {
        registerPending: registerSend.isPending,
        handleRegister
    }
}

const useAuthRecoveryHandlers = ({ form, validReset, updateAuthState, showToast }) => {
    const forgotSend = useSend({
        send: authService.forgotPassword,
        onSuccess: useCallback(() => {
            updateAuthState({ successMessage: 'Reset link sent! Check your inbox.' })
        }, [updateAuthState]),
        onError: useCallback(
            (forgotError = {}) => {
                updateAuthState({
                    error: forgotError.message || 'Failed to send reset link'
                })
            },
            [updateAuthState]
        )
    })

    const resetSend = useSend({
        send: authService.resetPassword,
        onSuccess: useCallback(() => {
            updateAuthState({ tab: 'login', successMessage: '', error: '' })
            showToast('Password reset successfully! You can now log in.')
        }, [updateAuthState, showToast]),
        onError: useCallback(
            (resetError = {}) => {
                updateAuthState({
                    error: resetError.message || 'Password reset failed. Please try again.'
                })
            },
            [updateAuthState]
        )
    })

    const handleForgot = useCallback(
        (event) => {
            event.preventDefault()
            const trimmedEmail = (form.email || '').trim()
            if (trimmedEmail && !isValidEmail(form.email)) {
                showToast(VALIDATION_MESSAGES.LA_VERDAD_EMAIL_PROMPT, 'danger')
                return
            }
            if (!trimmedEmail) {
                showToast(VALIDATION_MESSAGES.MISSING_FIELDS, 'warning')
                return
            }
            if (!forgotSend.isPending) {
                forgotSend.send({ email: form.email })
            }
        },
        [form.email, forgotSend, showToast]
    )

    const handleReset = useCallback(
        (event) => {
            event.preventDefault()
            if (!form.password || !form.confirmPassword) {
                showToast(VALIDATION_MESSAGES.MISSING_FIELDS, 'warning')
                return
            }
            if (validReset && !resetSend.isPending) {
                resetSend.send({
                    token: form.token,
                    email: form.email,
                    password: form.password
                })
            }
        },
        [form.password, form.confirmPassword, form.token, form.email, validReset, resetSend, showToast]
    )

    return {
        forgotPending: forgotSend.isPending,
        resetPending: resetSend.isPending,
        handleForgot,
        handleReset
    }
}

export const useAuthModalActions = ({
    form,
    validLogin,
    validRegister,
    validReset,
    onLoginSuccess,
    onClose,
    updateAuthState,
    showToast,
    initialFormState
}) => {
    const { loginPending, handleLogin } = useAuthLoginHandlers({
        form,
        validLogin,
        onLoginSuccess,
        onClose,
        updateAuthState,
        showToast,
        initialFormState
    })

    const { registerPending, handleRegister } = useAuthRegisterHandlers({
        form,
        validRegister,
        updateAuthState,
        showToast,
        initialFormState
    })

    const { forgotPending, resetPending, handleForgot, handleReset } = useAuthRecoveryHandlers({
        form,
        validReset,
        updateAuthState,
        showToast
    })

    return {
        loginPending,
        registerPending,
        forgotPending,
        resetPending,
        handleLogin,
        handleRegister,
        handleForgot,
        handleReset
    }
}
