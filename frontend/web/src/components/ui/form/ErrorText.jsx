export const ErrorText = ({ message = '', variant = 'error' }) => (
    <div className="h-4 flex items-center mt-1">
        {message ? (
            <span className={`text-[12px] ${variant === 'muted' ? 'text-neutral-400' : 'text-red-500'}`}>
                {message}
            </span>
        ) : null}
    </div>
)
