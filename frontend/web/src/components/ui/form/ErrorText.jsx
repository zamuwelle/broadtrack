import { cn } from 'cn'

export const ErrorText = ({
    message = '',
    variant = 'error',
    className = 'h-4 flex items-center mt-1',
    textClassName
}) => (
    <div className={className}>
        {message ? (
            <span
                className={
                    textClassName ||
                    cn('text-[12px]', {
                        'text-neutral-400': variant === 'muted',
                        'text-red-500': variant !== 'muted'
                    })
                }>
                {message}
            </span>
        ) : null}
    </div>
)
