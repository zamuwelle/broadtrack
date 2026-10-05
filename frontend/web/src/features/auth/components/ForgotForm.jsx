import { useCallback, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { forgotPasswordSchema } from '@shared/schemas/auth'
import { TextInput } from '@/components/ui/form/TextInput'
import { FormError } from '@/components/ui/form/FormError'
import { inputClass, submitClass } from '@/features/auth/components/authStyles'

const noop = () => null

export const ForgotForm = ({
    form,
    serverError = '',
    error = '',
    isPending = false,
    onSwitchTab = noop,
    onSubmit = noop,
    onInvalid = noop,
    onClearError = noop
}) => {
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

    return (
        <form noValidate className="flex flex-col gap-2.5" onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
