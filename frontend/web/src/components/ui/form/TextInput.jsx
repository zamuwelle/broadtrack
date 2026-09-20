import { FormField } from '@/components/ui/form/FormField'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { cn } from 'cn'

export const TextInput = ({ label, value, onChange, error = '', className = '', required = true, ...rest }) => (
    <FormField label={label} required={required}>
        <input
            className={cn(
                className || 'w-full border h-10 px-3 rounded-lg text-[14px] outline-none',
                error ? 'border-red-500' : 'border-gray-300'
            )}
            value={value}
            onChange={onChange}
            {...rest}
        />
        <ErrorText message={error} />
    </FormField>
)
