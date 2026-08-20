export const ErrorText = ({ message = '' }) => (
    <div className="h-4 flex items-center mt-1">
        {message ? <span className="text-[12px] text-red-500">{message}</span> : null}
    </div>
)
