import { DecisionFormActions } from '@/components/admin/approvals/DecisionFormActions'

export const DecisionForm = (props) => {
    const {
        isApprove,
        text,
        errorMessage,
        isSubmitting,
        borrowerName,
        equipmentName,
        onTextChange,
        onSubmit,
        onClose
    } = props

    const placeholder = isApprove
        ? 'e.g. Approved. Please pick up at DSR 101 before 1:00 PM.'
        : 'e.g. The equipment is scheduled for maintenance.'

    const borderClass = isApprove ? 'focus:border-amber-500' : 'focus:border-rose-500'

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
                <p>
                    <span className="font-semibold text-slate-700">Equipment: </span>
                    <span className="text-slate-900">{equipmentName}</span>
                </p>
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

            <DecisionFormActions isApprove={isApprove} isSubmitting={isSubmitting} onClose={onClose} />
        </form>
    )
}
