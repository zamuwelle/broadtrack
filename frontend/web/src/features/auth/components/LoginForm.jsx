import { useCallback } from 'react'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { Icon } from '@/components/ui/Icon'
import { inputClass, passwordClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null

export const LoginForm = ({
    form,
    emailError = '',
    passwordError = '',
    showPass = false,
    validLogin = false,
    isPending = false,
    onFieldChange = noop,
    onToggleShowPass = noop,
    onSwitchTab = noop,
    onSubmit = noop
}) => {
    const handleGoogleLogin = useCallback(() => {
        globalThis.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`
    }, [])

    const handleEmailChange = useCallback(
        (event) => {
            onFieldChange('email', event.target.value)
        },
        [onFieldChange]
    )

    const handlePasswordChange = useCallback(
        (event) => {
            onFieldChange('password', event.target.value)
        },
        [onFieldChange]
    )

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
            <form noValidate className="flex flex-col gap-2.5" onSubmit={onSubmit}>
                <TextInput
                    label="La Verdad Email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    value={form.email || ''}
                    onChange={handleEmailChange}
                    error={emailError}
                    className={inputClass}
                />
                <PasswordInput
                    maxLength={64}
                    label="Password"
                    autoComplete="current-password"
                    value={form.password || ''}
                    onChange={handlePasswordChange}
                    error={passwordError}
                    className={passwordClass}
                    showPass={showPass}
                    onToggleShow={onToggleShowPass}
                    actionText="Forgot password?"
                    onAction={handleSwitchForgot}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className={`${submitClass} ${validLogin ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}>
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
