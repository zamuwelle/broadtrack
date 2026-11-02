import { useCallback, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { resetPasswordSchema } from '@shared/schemas/auth'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { FormError } from '@/components/ui/form/FormError'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClass, passwordClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null

export const ResetForm = (props) => {
    const {
        form,
        error = '',
        showPass = false,
        isPending = false,
        onToggleShowPass = noop,
        onSwitchTab = noop,
        onSubmit = noop,
        onInvalid = noop,
        onClearError = noop
    } = props

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onChange',
        defaultValues: {
            token: form.token || '',
            email: form.email || '',
            password: form.password || '',
            confirmPassword: form.confirmPassword || ''
        }
    })
    const [watchedPassword, watchedConfirmPassword] = watch(['password', 'confirmPassword'])
    const firstChange = useRef(true)

    useEffect(
        () =>
            reset({
                token: form.token || '',
                email: form.email || '',
                password: form.password || '',
                confirmPassword: form.confirmPassword || ''
            }),
        [form.confirmPassword, form.email, form.password, form.token, reset]
    )

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        onClearError()
    }, [onClearError, watchedConfirmPassword, watchedPassword])

    const handleSwitchLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])

    return (
        <form noValidate className="flex flex-col gap-2.5" onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <input type="hidden" {...register('token')} />
            <input type="hidden" {...register('email')} />
            <FormError message={error} />
            <PasswordInput
                maxLength={64}
                label="New Password"
                name="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
                className={passwordClass}
                showPass={showPass}
                onToggleShow={onToggleShowPass}
            />
            <TextInput
                label="Confirm Password"
                name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                className={inputClass}
            />
            <button type="submit" disabled={!isValid || isPending} className={submitClass}>
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
