import { useCallback } from 'react'

const defaultBooking = Object.freeze({})
const noop = () => null

export const ApprovalPendingActions = ({ booking = defaultBooking, onApprove = noop, onReject = noop }) => {
    const handleApprove = useCallback(() => {
        onApprove(booking)
    }, [booking, onApprove])

    const handleReject = useCallback(() => {
        onReject(booking)
    }, [booking, onReject])

    return (
        <div className="w-full mt-4 flex flex-row items-center gap-3">
            <button
                type="button"
                onClick={handleApprove}
                className="flex-1 h-10 px-3 bg-amber-500 hover:bg-amber-600 transition-colors text-white text-sm sm:text-base font-medium rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs">
                <span className="text-sm sm:text-base font-semibold">✓</span>
                Approve<span className="hidden sm:inline"> Reservation</span>
            </button>
            <button
                type="button"
                onClick={handleReject}
                className="flex-1 h-10 px-3 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 border border-slate-300 text-sm sm:text-base font-medium rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer">
                <span className="text-sm sm:text-base font-semibold">✕</span>
                Reject<span className="hidden sm:inline"> Request</span>
            </button>
        </div>
    )
}
