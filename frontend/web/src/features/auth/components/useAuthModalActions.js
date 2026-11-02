import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginUser } from '@/features/auth/api/login'
import { registerUser } from '@/features/auth/api/register'
import { forgotPassword } from '@/features/auth/api/forgot-password'
import { resetPassword } from '@/features/auth/api/reset-password'
import { paths } from '@/config/paths'

const useAuthLoginHandlers = ({ onLoginSuccess, onClose, updateAuthState, showToast, initialFormState }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const saveAuth = useCallback(
        ({ data = {} }) => {
            if (data.token) {
                globalThis.localStorage.setItem('auth_token', data.token)
            }
            if (data.user) {
                queryClient.setQueryData(['me'], data.user)
                const firstName = data.user.firstname || 'User'
                globalThis.sessionStorage.setItem('welcome_message', `Welcome back, ${firstName}!`)
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess(data.user)
                }
            }
            updateAuthState({
                showPass: false,
                error: '',
                form: { ...initialFormState }
            })
            onClose()
            const user = data.user || {}
            const { role } = user
            navigate(role === 'admin' || role === 'sysadmin' ? paths.app.adminDashboard : paths.app.borrowEquipment, {
                replace: true
            })
        },
        [queryClient, onLoginSuccess, updateAuthState, initialFormState, onClose, navigate]
    )

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: saveAuth,
        onError: useCallback(
            (loginError = {}) => {
                if (loginError.status === 403) {
                    showToast(loginError.message)
                    updateAuthState({
                        tab: 'verify',
                        error: ''
                    })
                } else {
                    updateAuthState({
                        error: loginError.message || 'Email or password is incorrect',
                        isServerError: !loginError.status || loginError.status >= 500
                    })
                }
            },
            [showToast, updateAuthState]
        )
    })

    const handleLogin = useCallback(
        (data) => {
            if (!loginMutation.isPending) {
                updateAuthState((prev) => ({
                    form: { ...prev.form, email: data.email }
                }))
                loginMutation.mutate({ email: data.email, password: data.password })
            }
        },
        [loginMutation, updateAuthState]
    )

    return {
        loginPending: loginMutation.isPending,
        handleLogin
    }
}

const useAuthRegisterHandlers = ({ updateAuthState }) => {
    const showCheckInbox = useCallback(() => {
        updateAuthState({
            tab: 'verify',
            showPass: false,
            error: ''
        })
    }, [updateAuthState])

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: showCheckInbox,
        onError: useCallback(
            (registerError = {}) => {
                const errors = registerError.errors || {}
                const emailMsg = errors.email ? errors.email[0] : null
                updateAuthState({
                    error: emailMsg || registerError.message || 'Registration failed',
                    isServerError: !registerError.status || registerError.status >= 500
                })
            },
            [updateAuthState]
        )
    })

    const handleRegister = useCallback(
        (data) => {
            if (!registerMutation.isPending) {
                updateAuthState((prev) => ({
                    form: { ...prev.form, email: data.email }
                }))
                registerMutation.mutate(data)
            }
        },
        [registerMutation, updateAuthState]
    )

    return {
        registerPending: registerMutation.isPending,
        handleRegister
    }
}

const useAuthRecoveryHandlers = ({ updateAuthState, showToast, initialFormState }) => {
    const forgotMutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: useCallback(() => {
            updateAuthState({
                tab: 'login',
                error: '',
                isServerError: false,
                form: { ...initialFormState }
            })
            showToast('Reset link sent! Check your inbox.')
        }, [initialFormState, showToast, updateAuthState]),
        onError: useCallback(
            (forgotError = {}) => {
                updateAuthState({
                    error: forgotError.message || 'Failed to send reset link',
                    isServerError: !forgotError.status || forgotError.status >= 500
                })
            },
            [updateAuthState]
        )
    })

    const resetMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: useCallback(() => {
            updateAuthState({ tab: 'login', error: '' })
            showToast('Password reset successfully! You can now log in.')
        }, [updateAuthState, showToast]),
        onError: useCallback(
            (resetError = {}) => {
                if (resetError.status === 422 && resetError.message === 'Invalid or expired reset token.') {
                    updateAuthState({
                        tab: 'forgot',
                        error: '',
                        form: { ...initialFormState }
                    })
                    showToast('Invalid or expired reset link. Please request a new one.', 'warning')
                    return
                }
                updateAuthState({
                    error: resetError.message || 'Password reset failed. Please try again.'
                })
            },
            [initialFormState, showToast, updateAuthState]
        )
    })

    const handleForgot = useCallback(
        (data) => {
            if (!forgotMutation.isPending) {
                forgotMutation.mutate({ email: data.email })
            }
        },
        [forgotMutation]
    )

    const handleReset = useCallback(
        (data) => {
            if (!resetMutation.isPending) {
                resetMutation.mutate({
                    token: data.token,
                    email: data.email,
                    password: data.password
                })
            }
        },
        [resetMutation]
    )

    return {
        forgotPending: forgotMutation.isPending,
        resetPending: resetMutation.isPending,
        handleForgot,
        handleReset
    }
}

export const useAuthModalActions = ({ onLoginSuccess, onClose, updateAuthState, showToast, initialFormState }) => {
    const { loginPending, handleLogin } = useAuthLoginHandlers({
        onLoginSuccess,
        onClose,
        updateAuthState,
        showToast,
        initialFormState
    })

    const { registerPending, handleRegister } = useAuthRegisterHandlers({
        updateAuthState
    })

    const { forgotPending, resetPending, handleForgot, handleReset } = useAuthRecoveryHandlers({
        updateAuthState,
        showToast,
        initialFormState
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
