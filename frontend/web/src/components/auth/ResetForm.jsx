import { useCallback } from 'react'
import { getConfirmPasswordError, getPasswordError } from '@shared/util/validation'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClass, passwordClass, submitClass } from '@/components/auth/authStyles'

const noop = () => null

export const ResetForm = ({
    form,
    error = '',
    showPass = false,
    validReset = false,
    isPending = false,
    onFieldChange = noop,
    onToggleShowPass = noop,
    onSwitchTab = noop,
    onSubmit = noop
}) => {
    const handlePasswordChange = useCallback(
        (event) => {
            onFieldChange('password', event.target.value)
        },
        [onFieldChange]
    )

    const handleConfirmPasswordChange = useCallback(
        (event) => {
            onFieldChange('confirmPassword', event.target.value)
        },
        [onFieldChange]
    )

    const handleSwitchLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])

    const passwordError = getPasswordError(form.password)
    const confirmPasswordError = getConfirmPasswordError(form.password, form.confirmPassword)

    return (
        <form noValidate className="flex flex-col gap-2.5" onSubmit={onSubmit}>
            {error ? <div className="text-[13px] text-red-500 bg-red-50 p-2.5 rounded-[6px]">{error}</div> : null}
            <PasswordInput
                maxLength={64}
                label="New Password"
                name="password"
                autoComplete="new-password"
                value={form.password || ''}
                onChange={handlePasswordChange}
                error={passwordError}
                className={passwordClass}
                showPass={showPass}
                onToggleShow={onToggleShowPass}
            />
            <TextInput
                label="Confirm Password"
                name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword || ''}
                onChange={handleConfirmPasswordChange}
                error={confirmPasswordError}
                className={inputClass}
            />
            <button type="submit" disabled={!validReset || isPending} className={submitClass}>
                {isPending ? 'Updating password...' : 'Confirm Password'}
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
