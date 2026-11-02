import { cn } from 'cn'

export const FormError = ({ message, className }) =>
    message ? (
        <div role="alert" className={cn('text-[13px] text-red-500 bg-red-50 p-2.5 rounded-[6px]', className)}>
            {message}
        </div>
    ) : null
