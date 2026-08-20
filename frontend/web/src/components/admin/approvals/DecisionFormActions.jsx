import { Ban, Check } from 'lucide-react'

const noop = () => null

export const DecisionFormActions = ({ isApprove = true, isSubmitting = false, onClose = noop }) => {
    let submitLabel = isApprove ? 'Confirm Approval' : 'Confirm Rejection'
    if (isSubmitting) {
        submitLabel = isApprove ? 'Approving...' : 'Rejecting...'
    }

    const buttonClass = isApprove ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'

    return (
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
    )
}
