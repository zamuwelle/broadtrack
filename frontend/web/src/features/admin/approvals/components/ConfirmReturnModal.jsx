import { useCallback, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useToast } from '@/hooks/ui/useToast'
import { useReturnBooking } from '@/features/bookings/api/return-booking'

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
        equipments,
        equipmentName: equipment?.name || 'Equipment',
        timelineText: booking.date_time_range_label ?? ' – '
    }
}

export const ConfirmReturnModal = ({ isOpen = false, onClose = noop, booking = defaultBooking, onSuccess = noop }) => {
    const returnMutation = useReturnBooking()
    const { show: showToast } = useToast()
    const isSubmitting = returnMutation.isPending
    const [errorMessage, setErrorMessage] = useState('')

    useEscapeKey(onClose)

    const handleConfirmReturn = useCallback(async () => {
        if (isSubmitting || !booking || !booking.id) {
            return
        }
        try {
            setErrorMessage('')
            await returnMutation.mutateAsync(booking.id)
            onSuccess()
            onClose()
        } catch (error) {
            const message = (error && error.message) || 'Failed to confirm return'
            setErrorMessage(message)
            showToast(message, 'danger')
        }
    }, [booking, isSubmitting, onClose, onSuccess, returnMutation, showToast])

    if (!isOpen || !booking || !booking.id) {
        return null
    }

    const { borrowerName, borrowerDepartment, equipments, equipmentName, timelineText } =
        getConfirmModalDetails(booking)

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
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                            Confirm Equipment Return
                        </h2>
                        <p className="text-xs font-medium text-slate-500">Ticket ID: {booking.ticket_id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {errorMessage ? (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mt-5 flex flex-col gap-4">
                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">BORROWER</div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                            {borrowerName}
                            {borrowerDepartment}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">
                            {equipments.length > 1
                                ? `EQUIPMENT DETAILS (${equipments.length} ITEMS)`
                                : 'EQUIPMENT DETAILS'}
                        </div>
                        {equipments.length > 1 ? (
                            <div className="mt-1 flex flex-col gap-1">
                                {equipments.map((item) => (
                                    <div key={item.id} className="text-sm font-semibold text-slate-900">
                                        • {item.name} {item.model ? `(${item.model})` : ''}
                                    </div>
                                ))}
                                <div className="text-xs text-amber-600 font-medium mt-1">
                                    Note: Confirming return applies to all equipment items on this ticket.
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm font-semibold text-slate-900 mt-0.5">{equipmentName}</div>
                        )}
                    </div>

                    <div>
                        <div className="text-xs font-bold text-slate-500 tracking-wider">TIMELINE</div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">{timelineText}</div>
                    </div>
                </div>

                <div className="pt-8 flex justify-center w-full">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirmReturn}
                        className="h-12 w-[200px] max-w-full bg-success hover:bg-success/90 transition-colors rounded-xl text-white text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <Check size={18} />
                        {isSubmitting ? 'Confirming...' : 'Confirm Return'}
                    </button>
                </div>
            </div>
        </div>
    )
}
