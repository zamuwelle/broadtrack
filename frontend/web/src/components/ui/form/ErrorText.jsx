import { cn } from 'cn'

export const ErrorText = ({ message = '', variant = 'error' }) => (
    <div className="h-4 flex items-center mt-1">
        {message ? (
            <span
                className={cn('text-[12px]', {
                    'text-neutral-400': variant === 'muted',
                    'text-red-500': variant !== 'muted'
                })}>
                {message}
            </span>
        ) : null}
    </div>
)
