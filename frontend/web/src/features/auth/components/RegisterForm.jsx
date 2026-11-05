import { useCallback, useEffect, useRef } from 'react'
import { cn } from 'cn'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { registerSchema } from '@shared/schemas/auth'
import { Select } from '@/components/ui/Select'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { FormField as Field } from '@/components/ui/form/FormField'
import { PasswordInput } from '@/components/ui/form/PasswordInput'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClassSmall, passwordClassSmall, submitClass } from '@/features/auth/components/authStyles'
import { RegisterNameFields } from '@/features/auth/components/RegisterNameFields'
import { RegisterFooter } from '@/features/auth/components/RegisterFooter'
import { DEPARTMENTS } from '@shared/constants'

const DEFAULT_FORM = Object.freeze({})
const noop = () => null

export const RegisterForm = (props) => {
    const {
        form = DEFAULT_FORM,
        firstnameError,
        lastnameError,
        emailError,
        departmentError,
        passwordError,
        showPass,
        isPending,
        onToggleShowPass,
        onSwitchTab,
        onSubmit,
        onInvalid = noop,
        onClearError = noop
    } = props

    const { firstname = '', lastname = '', email = '', department = '', password = '' } = form
    const {
        register,
        control,
        watch,
        handleSubmit,
        getValues,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        shouldFocusError: false,
        defaultValues: { firstname, lastname, email, department, password }
    })
    const [watchedFirstname, watchedLastname, watchedEmail, watchedDepartment, watchedPassword] = watch([
        'firstname',
        'lastname',
        'email',
        'department',
        'password'
    ])
    const firstChange = useRef(true)

    useEffect(() => {
        if (firstChange.current) {
            firstChange.current = false
            return
        }
        onClearError()
    }, [onClearError, watchedDepartment, watchedEmail, watchedFirstname, watchedLastname, watchedPassword])

    useEffect(() => {
        reset({ firstname, lastname, email, department, password })
    }, [department, email, firstname, lastname, password, reset])

    const handleSwitchLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])
    const renderDepartment = useCallback(
        ({ field }) => (
            <Select
                {...field}
                options={DEPARTMENTS}
                placeholder="Select Department"
                error={(watchedDepartment && errors.department?.message) || departmentError}
                panelClass="right-0 left-auto! w-full bg-surface shadow-lg"
                hoverClass="hover:bg-slate-100"
                selectedClass="bg-border-focus"
                className="w-full bg-surface border border-gray-300 h-[40px] px-3 gap-2 text-[14px] text-text"
            />
        ),
        [departmentError, errors.department?.message, watchedDepartment]
    )

    const submitButtonClass = cn(submitClass, isValid ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed')

    return (
        <>
            <form
                noValidate
                className="flex flex-col gap-2.5"
                onSubmit={handleSubmit(onSubmit, (invalidErrors) => onInvalid(invalidErrors, getValues()))}>
                <RegisterNameFields
                    firstname={firstname}
                    lastname={lastname}
                    firstnameError={(watchedFirstname && errors.firstname?.message) || firstnameError}
                    lastnameError={(watchedLastname && errors.lastname?.message) || lastnameError}
                    register={register}
                />
                <TextInput
                    label="La Verdad Email"
                    name="email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    error={(watchedEmail && errors.email?.message) || emailError}
                    {...register('email')}
                    className={inputClassSmall}
                />
                <Field label="Department">
                    <Controller name="department" control={control} render={renderDepartment} />
                    <ErrorText message={(watchedDepartment && errors.department?.message) || departmentError} />
                </Field>
                <PasswordInput
                    maxLength={64}
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    error={(watchedPassword && errors.password?.message) || passwordError}
                    {...register('password')}
                    className={passwordClassSmall}
                    showPass={showPass}
                    onToggleShow={onToggleShowPass}
                />
                <button type="submit" disabled={isPending} className={submitButtonClass}>
                    {isPending ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <RegisterFooter onSwitchLogin={handleSwitchLogin} />
        </>
    )
}
