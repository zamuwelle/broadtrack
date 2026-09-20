import { useCallback, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { loginSchema } from '@shared/schemas/auth'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { Icon } from '@/components/ui/Icon'
import { env } from '@/config/env'
import { inputClass, passwordClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null
const popupStorageKey = 'google_oauth_popup_nonce'
const popupMessageType = 'broadtrack:google-oauth'

const isPopupResult = (data, nonce) => {
    if (!data || data.type !== popupMessageType || data.nonce !== nonce) {
        return false
    }
    if (data.status === 'success') {
        return (
            typeof data.token === 'string' && data.token.length > 0 && ['/dashboard', '/equipment'].includes(data.path)
        )
    }
    if (data.status === 'register') {
        return ['email', 'firstname', 'lastname', 'profile_picture'].every(
            (key) => typeof data[key] === 'string' && data[key].length <= 2048
        )
    }
    if (data.status === 'error') {
        return typeof data.error === 'string' && data.error.length <= 512
    }
    return data.status === 'cancel'
}

const handlePopupResult = (result) => {
    if (result.status === 'success') {
        globalThis.localStorage.setItem('auth_token', result.token)
        globalThis.location.assign(result.path)
        return
    }

    const params = new URLSearchParams()
    if (result.status === 'register') {
        params.set('tab', 'register')
        for (const key of ['email', 'firstname', 'lastname', 'profile_picture']) {
            if (result[key]) {
                params.set(key, result[key])
            }
        }
    } else if (result.status === 'error') {
        params.set('error', result.error)
    }
    const query = params.toString()
    globalThis.location.assign(query ? `/?${query}` : '/')
}

const useGooglePopup = () => {
    const popupRef = useRef(null)
    const nonceRef = useRef('')
    const cleanupRef = useRef(noop)

    const clearPopup = useCallback((closePopup = true) => {
        cleanupRef.current()
        cleanupRef.current = noop
        if (closePopup && popupRef.current && !popupRef.current.closed) {
            popupRef.current.close()
        }
        popupRef.current = null
        nonceRef.current = ''
    }, [])

    const handlePopupMessage = useCallback(
        (event) => {
            const popup = popupRef.current
            const nonce = nonceRef.current
            if (
                event.origin !== globalThis.location.origin ||
                !popup ||
                event.source !== popup ||
                !isPopupResult(event.data, nonce)
            ) {
                return
            }

            const { data: result } = event
            clearPopup()
            handlePopupResult(result)
        },
        [clearPopup]
    )

    useEffect(() => () => clearPopup(), [clearPopup])

    const handleGoogleLogin = useCallback(() => {
        if (popupRef.current) {
            if (!popupRef.current.closed) {
                popupRef.current.focus()
                return
            }
            clearPopup(false)
        }

        const redirectUrl = `${env.API_URL}/auth/google/redirect`
        const popup = globalThis.open('', '_blank', 'popup,width=520,height=680')

        if (!popup) {
            globalThis.location.href = redirectUrl
            return
        }

        const nonce = globalThis.crypto.randomUUID()
        try {
            popup.sessionStorage.setItem(popupStorageKey, nonce)
        } catch {
            popup.close()
            globalThis.location.href = redirectUrl
            return
        }
        popupRef.current = popup
        nonceRef.current = nonce
        globalThis.addEventListener('message', handlePopupMessage)
        const closePoll = globalThis.setInterval(() => {
            if (popup.closed) {
                clearPopup(false)
            }
        }, 500)
        cleanupRef.current = () => {
            globalThis.removeEventListener('message', handlePopupMessage)
            globalThis.clearInterval(closePoll)
        }
        popup.location.href = redirectUrl
    }, [clearPopup, handlePopupMessage])

    return handleGoogleLogin
}

export const LoginForm = ({
    form,
    emailError = '',
    passwordError = '',
    showPass = false,
    isPending = false,
    onToggleShowPass = noop,
    onSwitchTab = noop,
    onSubmit = noop,
    onInvalid = noop,
    onClearError = noop
}) => {
    const handleGoogleLogin = useGooglePopup()
    const {
        register,
        watch,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: form.email || '',
            password: form.password || ''
        }
    })
    const emailValue = watch('email')
    const passwordValue = watch('password')
    const firstChange = useRef(true)

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        onClearError()
    }, [emailValue, onClearError, passwordValue])

    useEffect(() => {
        reset({
            email: form.email || '',
            password: form.password || ''
        })
    }, [form.email, form.password, reset])

    const handleSwitchForgot = useCallback(() => {
        onSwitchTab('forgot')
    }, [onSwitchTab])

    const handleSwitchRegister = useCallback(() => {
        onSwitchTab('register')
    }, [onSwitchTab])

    return (
        <>
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-[44px] border border-gray-300 rounded-[8px] flex items-center justify-center gap-2 text-text text-[14px] font-medium hover:bg-gray-50 transition-colors">
                <Icon name="google" className="w-4 h-4" />
                Continue with Google
            </button>
            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-gray-400 text-[13px]">or</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
            </div>
            <form noValidate className="flex flex-col gap-2.5" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <TextInput
                    label="La Verdad Email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    error={errors.email?.message || emailError}
                    {...register('email')}
                    className={inputClass}
                />
                <PasswordInput
                    maxLength={64}
                    label="Password"
                    autoComplete="current-password"
                    error={errors.password?.message || passwordError}
                    {...register('password')}
                    className={passwordClass}
                    showPass={showPass}
                    onToggleShow={onToggleShowPass}
                    actionText="Forgot password?"
                    onAction={handleSwitchForgot}
                />
                <button
                    type="submit"
                    disabled={isPending || !isValid}
                    className={`${submitClass} ${isValid ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}>
                    {isPending ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <p className="text-center text-[13px] text-text/70 mt-4">
                Don&apos;t have an account?{' '}
                <button
                    type="button"
                    onClick={handleSwitchRegister}
                    className="text-primary font-semibold hover:underline">
                    Sign up
                </button>
            </p>
        </>
    )
}
