import { Eye, EyeOff } from 'lucide-react'
import { FormField } from '@/components/ui/form/FormField'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { cn } from 'cn'

const noop = () => null

export const PasswordInput = ({
    label = 'Password',
    value,
    onChange,
    error = '',
    className = '',
    actionText = '',
    onAction = noop,
    showPass = false,
    showPassword = false,
    onToggleShow,
    required = true,
    ...rest
}) => {
    const isVisible = showPass || showPassword
    return (
        <FormField label={label} required={required} actionText={actionText} onAction={onAction}>
            <div className="relative">
                <input
                    type={isVisible ? 'text' : 'password'}
                    className={cn(
                        className || 'w-full border h-10 pl-3 pr-10 rounded-lg text-[14px] outline-none',
                        error ? 'border-red-500' : 'border-gray-300'
                    )}
                    value={value}
                    onChange={onChange}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text/60 hover:text-text cursor-pointer">
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <ErrorText message={error} />
        </FormField>
    )
}
