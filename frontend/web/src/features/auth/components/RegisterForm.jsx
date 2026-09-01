import { useCallback } from 'react'
import { formatPhone } from '@shared/util/phone'
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

export const RegisterForm = (props) => {
    const {
        form = DEFAULT_FORM,
        firstnameError,
        lastnameError,
        emailError,
        phoneError,
        departmentError,
        passwordError,
        showPass,
        validRegister,
        isPending,
        onFieldChange,
        onToggleShowPass,
        onSwitchTab,
        onSubmit
    } = props

    const { firstname = '', lastname = '', email = '', phone = '', department = '', password = '' } = form

    const handleInputChange = useCallback(
        (event) => {
            const { name, value } = event.target
            onFieldChange(name, name === 'phone' ? formatPhone(value) : value)
        },
        [onFieldChange]
    )

    const handleDepartmentChange = useCallback(
        (value) => {
            onFieldChange('department', value)
        },
        [onFieldChange]
    )

    const handleSwitchLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])

    const submitButtonClass = `${submitClass} ${validRegister ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`

    return (
        <>
            <form noValidate className="flex flex-col gap-2.5" onSubmit={onSubmit}>
                <RegisterNameFields
                    firstname={firstname}
                    lastname={lastname}
                    firstnameError={firstnameError}
                    lastnameError={lastnameError}
                    onChange={handleInputChange}
                />
                <TextInput
                    label="La Verdad Email"
                    name="email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    value={email}
                    onChange={handleInputChange}
                    error={emailError}
                    className={inputClassSmall}
                />
                <TextInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    maxLength={20}
                    value={phone}
                    onChange={handleInputChange}
                    error={phoneError}
                    className={inputClassSmall}
                />
                <Field label="Department">
                    <Select
                        value={department}
                        onChange={handleDepartmentChange}
                        options={DEPARTMENTS}
                        placeholder="Select Department"
                        error={departmentError}
                        panelClass="right-0 left-auto! w-full bg-surface shadow-lg"
                        hoverClass="hover:bg-slate-100"
                        selectedClass="bg-border-focus"
                        className="w-full bg-surface border border-gray-300 h-[40px] px-3 gap-2 text-[14px] text-text"
                    />
                    <ErrorText message={departmentError} />
                </Field>
                <PasswordInput
                    maxLength={64}
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handleInputChange}
                    error={passwordError}
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
