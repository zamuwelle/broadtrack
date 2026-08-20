import { useCallback } from 'react'

const defaultBooking = Object.freeze({})
const noop = () => null

export const ApprovalConfirmedAction = ({ booking = defaultBooking, onReturn = noop }) => {
    const handleReturn = useCallback(() => {
        onReturn(booking)
    }, [booking, onReturn])

    return (
        <div className="w-full mt-4 flex items-center justify-end">
            <button
                type="button"
                onClick={handleReturn}
                className="w-full sm:w-[calc(50%-8px)] h-10 px-4 bg-green-500 hover:bg-green-600 transition-colors text-white text-base font-medium rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <svg
                    className="w-4 h-4 text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
                Mark Returned &amp; Stock Feed
            </button>
        </div>
    )
}
