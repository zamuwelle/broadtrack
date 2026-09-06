import { DecisionFormActions } from '@/features/admin/approvals/components/DecisionFormActions'

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

            <DecisionFormActions isApprove={isApprove} isSubmitting={isSubmitting} onClose={onClose} />
        </form>
    )
}
