import { Check } from 'lucide-react'
import { cn } from 'cn'

export const DecisionForm = (props) => {
    const {
        isApprove,
        text,
        errorMessage,
        isSubmitting,
        borrowerName,
        equipments = [],
        equipmentName,
        dateTimeRangeLabel,
        onTextChange,
        onSubmit
    } = props

    const placeholder = isApprove
        ? 'Approved. Pick up at DSR 101...'
        : 'The requested equipment is already committed to...'

    let submitLabel = isApprove ? 'Approve & Notify' : 'Reject Request'
    if (isSubmitting) {
        submitLabel = isApprove ? 'Approving...' : 'Rejecting...'
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-5">
            {errorMessage ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {errorMessage}
                </div>
            ) : null}
            <div className="bg-slate-50 rounded-xl p-4 text-sm flex flex-col gap-1 border border-slate-200">
                <p>
                    <span className="font-semibold text-slate-700">Borrower: </span>
                    <span className="text-slate-900">{borrowerName}</span>
                </p>
                <div>
                    {equipments.length > 1 ? (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700">Equipment:</span>
                            {equipments.map((item) => (
                                <span key={item.id} className="text-slate-900">
                                    {item.name} {item.model ? `(${item.model})` : ''}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p>
                            <span className="font-semibold text-slate-700">Equipment: </span>
                            <span className="text-slate-900">{equipmentName}</span>
                        </p>
                    )}
                </div>
                <p>
                    <span className="font-semibold text-slate-700">Dates: </span>
                    <span className="text-slate-900">{dateTimeRangeLabel}</span>
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="decision-note" className="text-xs font-semibold text-slate-700">
                    {isApprove ? (
                        <>
                            Pickup Location / Cabinet Notes<span className="ml-1 text-danger">*</span>
                        </>
                    ) : (
                        <>
                            Rejection Reason<span className="ml-1 text-danger">*</span>
                        </>
                    )}
                </label>
                <textarea
                    id="decision-note"
                    rows={3}
                    required
                    value={text}
                    onChange={onTextChange}
                    placeholder={placeholder}
                    className={cn(
                        'w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none text-slate-800 resize-none',
                        {
                            'focus:border-amber-500': isApprove,
                            'focus:border-rose-500': !isApprove
                        }
                    )}
                />
            </div>

            <div className="flex justify-center pt-4 w-full">
                <button
                    type="submit"
                    disabled={isSubmitting || !text.trim()}
                    className={cn(
                        'h-12 w-[200px] max-w-full rounded-xl text-white text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                        {
                            'bg-warning hover:bg-warning/90': isApprove,
                            'bg-danger hover:bg-danger-hover': !isApprove
                        }
                    )}>
                    {isApprove ? <Check size={18} /> : null}
                    {submitLabel}
                </button>
            </div>
        </form>
    )
}
