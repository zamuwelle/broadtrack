import { Ban, Check } from 'lucide-react'

export const DecisionForm = (props) => {
    const {
        isApprove,
        text,
        errorMessage,
        isSubmitting,
        borrowerName,
        equipments = [],
        equipmentName,
        onTextChange,
        onSubmit,
        onClose
    } = props

    const placeholder = isApprove
        ? 'e.g. Approved. Please pick up at DSR 101 before 1:00 PM.'
        : 'e.g. The equipment is scheduled for maintenance.'

    const borderClass = isApprove ? 'focus:border-amber-500' : 'focus:border-rose-500'

    let submitLabel = isApprove ? 'Confirm Approval' : 'Confirm Rejection'
    if (isSubmitting) {
        submitLabel = isApprove ? 'Approving...' : 'Rejecting...'
    }
    const buttonClass = isApprove ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-5">
            {errorMessage ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {errorMessage}
                </div>
            ) : null}
            <div className="bg-slate-50 rounded-xl p-4 text-xs flex flex-col gap-1 border border-slate-200">
                <p>
                    <span className="font-semibold text-slate-700">Borrower: </span>
                    <span className="text-slate-900">{borrowerName}</span>
                </p>
                <div>
                    <span className="font-semibold text-slate-700">
                        {equipments.length > 1 ? `Equipment (${equipments.length} items):` : 'Equipment: '}
                    </span>
                    {equipments.length > 1 ? (
                        <div className="mt-1 flex flex-col gap-0.5">
                            {equipments.map((item) => (
                                <span key={item.id} className="text-slate-900 font-medium">
                                    • {item.name} {item.model ? `(${item.model})` : ''}
                                </span>
                            ))}
                            <span className="text-[11px] text-amber-600 font-medium mt-0.5">
                                Note: {isApprove ? 'Approval' : 'Rejection'} applies to the entire reservation ticket.
                            </span>
                        </div>
                    ) : (
                        <span className="text-slate-900">{equipmentName}</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                    {isApprove ? (
                        'Pickup Note / Instructions for Borrower'
                    ) : (
                        <>
                            Reason for Rejection <span className="text-rose-500">*</span>
                        </>
                    )}
                </label>
                <textarea
                    rows={3}
                    required={!isApprove}
                    value={text}
                    onChange={onTextChange}
                    placeholder={placeholder}
                    className={`w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none text-slate-800 resize-none ${borderClass}`}
                />
            </div>

            <div className="flex flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 w-full">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial h-10 px-5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 sm:flex-initial h-10 px-6 rounded-lg text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors ${buttonClass}`}>
                    {isApprove ? <Check size={16} /> : <Ban size={16} />}
                    {submitLabel}
                </button>
            </div>
        </form>
    )
}
