import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { useToast } from '@/hooks/ui/useToast'
import { useApproveBooking } from '@/features/bookings/api/approve-booking'
import { useRejectBooking } from '@/features/bookings/api/reject-booking'
import { DecisionForm } from '@/features/admin/approvals/components/DecisionForm'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

const getDecisionModalDetails = (booking) => {
    const equipments = booking.equipments ?? defaultList
    const equipment = equipments[0] || defaultBooking
    return {
        equipments,
        equipmentName: equipment.name || 'Equipment',
        borrowerName: booking.user?.full_name || 'Borrower'
    }
}

export const DecisionModal = ({ isOpen = false, onClose = noop, booking = defaultBooking, type = 'approve' }) => {
    const approveMutation = useApproveBooking()
    const rejectMutation = useRejectBooking()
    const { show: showToast } = useToast()
    const isApprove = type === 'approve'

    const [modalState, updateModalState] = useSetState({
        text: '',
        errorMessage: ''
    })
    const isSubmitting = approveMutation.isPending || rejectMutation.isPending
    const { text, errorMessage } = modalState
    const isMounted = useRef(false)

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    useEscapeKey(onClose)

    const handleTextChange = useCallback(
        (event) => {
            updateModalState({ text: event.target.value, errorMessage: '' })
        },
        [updateModalState]
    )

    const bookingId = booking ? booking.id : null

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            if (isSubmitting || !bookingId) {
                return
            }
            if (!isApprove && !text.trim()) {
                updateModalState({ errorMessage: 'Please provide a rejection reason' })
                return
            }
            try {
                updateModalState({ errorMessage: '' })
                await (isApprove
                    ? approveMutation.mutateAsync({ bookingId, data: { approval_note: text } })
                    : rejectMutation.mutateAsync({ bookingId, data: { rejection_reason: text } }))
                if (isMounted.current) {
                    onClose()
                }
            } catch (error) {
                const message = (error && error.message) || `Failed to ${type} booking`
                if (isMounted.current) {
                    updateModalState({
                        errorMessage: message
                    })
                }
                showToast(message, 'danger')
            }
        },
        [
            approveMutation,
            bookingId,
            isApprove,
            isSubmitting,
            onClose,
            rejectMutation,
            showToast,
            text,
            type,
            updateModalState
        ]
    )

    if (!isOpen || !booking || !booking.id) {
        return null
    }

    const { equipments, equipmentName, borrowerName } = getDecisionModalDetails(booking)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
                onClick={onClose}
            />
            <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-[480px] max-h-[90dvh] overflow-y-scroll my-auto shadow-2xl font-['Poppins'] flex flex-col p-4 sm:p-6 relative z-10">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isApprove ? 'Approve Reservation' : 'Reject Request'}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Ticket ID: {booking.ticket_id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
                        <X size={18} />
                    </button>
                </div>

                <DecisionForm
                    isApprove={isApprove}
                    text={text}
                    errorMessage={errorMessage}
                    isSubmitting={isSubmitting}
                    borrowerName={borrowerName}
                    equipments={equipments}
                    equipmentName={equipmentName}
                    onTextChange={handleTextChange}
                    onSubmit={handleSubmit}
                    onClose={onClose}
                />
            </div>
        </div>
    )
}
