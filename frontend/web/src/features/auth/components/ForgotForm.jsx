import { useCallback } from 'react'
import { Logo } from '@/components/ui/Logo'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null

export const ForgotForm = ({
    form,
    error = '',
    successMessage = '',
    validForgot = false,
    isPending = false,
    onFieldChange = noop,
    onSwitchTab = noop,
    onSubmit = noop
}) => {
    const handleEmailChange = useCallback(
        (event) => {
            onFieldChange('email', event.target.value)
        },
        [onFieldChange]
    )

    const handleSwitchLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])

    if (successMessage) {
        return (
            <div className="flex flex-col items-center gap-6">
                <Logo />
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-[20px] font-bold text-text">Check Your Inbox</h4>
                    <p className="text-[13px] text-text/70">We sent a password reset link to:</p>
                    <p className="text-[14px] font-semibold text-primary break-all">{form.email}</p>
                </div>
                <button
                    type="button"
                    onClick={handleSwitchLogin}
                    className="w-full bg-primary text-surface h-[44px] rounded-[8px] text-[15px] font-medium hover:opacity-90 transition-opacity">
                    Back to Sign In
                </button>
            </div>
        )
    }

    return (
        <form noValidate className="flex flex-col gap-2.5" onSubmit={onSubmit}>
            <TextInput
                label="La Verdad Email"
                type="email"
                maxLength={255}
                autoComplete="email"
                value={form.email || ''}
                onChange={handleEmailChange}
                error={error}
                className={inputClass}
            />
            <button type="submit" disabled={!validForgot || isPending} className={submitClass}>
                {isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-[13px] text-text/70 mt-4">
                Remember your password?{' '}
                <button
                    type="button"
                    onClick={handleSwitchLogin}
                    className="text-primary font-semibold hover:underline">
                    Back to Sign In
                </button>
            </p>
        </form>
    )
}
