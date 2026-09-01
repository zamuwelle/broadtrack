import { useCallback, useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatDate } from '@shared/util/date'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useReturnBooking } from '@/api/bookings/return-booking'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

const getConfirmModalDetails = (booking) => {
    const borrower = booking.user || defaultBooking
    const equipments = booking.equipments || defaultList
    const equipment = equipments[0] || null
    return {
        borrowerName: borrower.full_name || 'Borrower',
        borrowerDepartment: borrower.department ? ` (${borrower.department})` : '',
        equipmentName: equipment?.name || 'Equipment',
        timelineText: `${formatDate(booking.start_date)} – ${formatDate(booking.end_date)}`
    }
}

export const ConfirmReturnModal = ({ isOpen = false, onClose = noop, booking = defaultBooking, onSuccess = noop }) => {
    const returnMutation = useReturnBooking()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEscapeKey(onClose)

    const handleConfirmReturn = useCallback(async () => {
        if (!booking || !booking.id) {
            return
        }
        try {
            setIsSubmitting(true)
            setErrorMessage('')
            await returnMutation.mutateAsync(booking.id)
            onSuccess()
            onClose()
        } catch (error) {
            setErrorMessage((error && error.message) || 'Failed to confirm return')
        } finally {
            setIsSubmitting(false)
        }
    }, [booking, onClose, onSuccess, returnMutation])

    if (!isOpen || !booking || !booking.id) {
        return null
    }

    const { borrowerName, borrowerDepartment, equipmentName, timelineText } = getConfirmModalDetails(booking)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
                onClick={onClose}
            />
            <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-[560px] max-h-[90dvh] overflow-y-scroll my-auto shadow-2xl flex flex-col p-4 sm:p-7 relative z-10">
                <div className="flex items-start justify-between gap-4 pb-4 sm:pb-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            CONFIRM EQUIPMENT RETURN
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-slate-500">Ticket ID: {booking.ticket_id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 sm:size-10 rounded-[10px] border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                        {errorMessage}
                    </div>
                )}

                <div className="bg-slate-50 rounded-2xl border border-slate-300 p-4 sm:p-6 flex flex-col gap-4">
                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">BORROWER</div>
                        <div className="text-base font-semibold text-slate-900 mt-0.5">
                            {borrowerName}
                            {borrowerDepartment}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">EQUIPMENT DETAILS</div>
                        <div className="text-base font-semibold text-slate-900 mt-0.5">{equipmentName}</div>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">TIMELINE</div>
                        <div className="text-base font-semibold text-slate-900 mt-0.5">{timelineText}</div>
                    </div>
                </div>

                <div className="pt-8 flex justify-center w-full">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirmReturn}
                        className="h-12 w-full sm:w-48 bg-green-500 hover:bg-green-600 transition-colors rounded-xl text-white text-base font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50">
                        <Check size={18} />
                        {isSubmitting ? 'Confirming...' : 'Confirm Return'}
                    </button>
                </div>
            </div>
        </div>
    )
}
