const noop = () => null

export const FormField = ({ label, required = true, actionText = '', onAction = noop, children }) => (
    <div>
        {actionText ? (
            <div className="flex justify-between items-center mb-1">
                <label className="text-[13px] font-medium text-text">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <button
                    type="button"
                    onClick={onAction}
                    className="text-[12px] text-primary hover:underline font-medium">
                    {actionText}
                </button>
            </div>
        ) : (
            <label className="text-[13px] font-medium text-text mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        {children}
    </div>
)
