import { useCallback, useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { forgotPasswordSchema } from '@shared/schemas/auth'
import { Logo } from '@/components/ui/Logo'
import { TextInput } from '@/components/ui/form/TextInput'
import { FormError } from '@/components/ui/form/FormError'
import { inputClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null

export const ForgotForm = ({
    form,
    serverError = '',
    error = '',
    successMessage = '',
    isPending = false,
    onSwitchTab = noop,
    onSubmit = noop,
    onInvalid = noop,
    onClearError = noop
}) => {
    const [submittedEmail, setSubmittedEmail] = useState('')
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange',
        defaultValues: { email: form.email || '' }
    })

    const emailValue = watch('email')
    const firstChange = useRef(true)

    useEffect(() => {
        reset({ email: form.email || '' })
        setSubmittedEmail('')
    }, [form.email, reset])

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        onClearError()
    }, [emailValue, onClearError])

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
                    <p className="text-[14px] font-semibold text-primary break-all">{submittedEmail || form.email}</p>
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
        <form
            noValidate
            className="flex flex-col gap-2.5"
            onSubmit={handleSubmit((values) => {
                setSubmittedEmail(values.email)
                onSubmit(values)
            }, onInvalid)}>
            <FormError message={serverError} />
            <TextInput
                label="La Verdad Email"
                type="email"
                maxLength={255}
                autoComplete="email"
                error={errors.email?.message || error}
                {...register('email')}
                className={inputClass}
            />
            <button type="submit" disabled={!isValid || isPending} className={submitClass}>
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
