import { useCallback } from 'react'
import { formatDate, getOverdueDuration } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { SendReminderModal } from '@/features/admin/transactions/components/SendReminderModal'
import { ConfirmReturnModal } from '@/features/admin/approvals/components/ConfirmReturnModal'
import { ModalHeader } from '@/features/admin/transactions/components/ModalHeader'
import { ActivityLogSection } from '@/features/admin/transactions/components/ActivityLogSection'
import { Mail } from 'lucide-react'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

const getTransactionVariant = (booking) => {
    const status = getBookingStatus(booking)
    if (status === 'rejected') {
        return 'rejected'
    }
    if (status === 'cancelled' || status === 'canceled') {
        return 'cancelled'
    }
    if (status === 'returned') {
        return 'completed'
    }
    return booking.is_overdue ? 'overdue' : 'active'
}

const getEquipmentBadge = (variant) => {
    if (variant === 'rejected' || variant === 'completed' || variant === 'cancelled') {
        return {
            label: 'Available',
            className: 'bg-green-100 border-green-500 text-green-500'
        }
    }
    return {
        label: 'Borrowed',
        className: 'bg-blue-200 border-sky-800 text-sky-800'
    }
}

const getStatusBadge = (variant) => {
    if (variant === 'rejected') {
        return { label: 'Rejected', className: 'bg-rose-50 text-rose-700' }
    }
    if (variant === 'cancelled') {
        return { label: 'Cancelled', className: 'bg-slate-100 text-slate-600' }
    }
    if (variant === 'completed') {
        return { label: 'Completed', className: 'bg-blue-200 text-sky-800' }
    }
    if (variant === 'overdue') {
        return {
            label: 'Overdue',
            className: 'bg-orange-50 text-amber-500 border border-amber-500'
        }
    }
    return { label: 'Confirmed', className: 'bg-green-100 text-green-500' }
}

const getTimelineColor = (variant) => {
    if (variant === 'rejected') {
        return 'bg-red-500'
    }
    if (variant === 'cancelled') {
        return 'bg-slate-400'
    }
    if (variant === 'completed') {
        return 'bg-sky-600'
    }
    if (variant === 'overdue') {
        return 'bg-amber-500'
    }
    return 'bg-emerald-500'
}

const getEquipmentId = (equipment, booking) => {
    if (equipment && equipment.id) {
        return `eq-${equipment.id}`
    }
    if (booking && booking.equipment_id) {
        return `eq-${booking.equipment_id}`
    }
    return 'eq-1'
}

const useTransactionModalState = (onClose, onReturnConfirmed) => {
    const [modalState, updateModalState] = useSetState({
        isSendReminderOpen: false,
        isConfirmReturnOpen: false
    })
    const { isSendReminderOpen, isConfirmReturnOpen } = modalState

    const handleEscape = useCallback(() => {
        if (isSendReminderOpen) {
            updateModalState({ isSendReminderOpen: false })
            return
        }
        if (isConfirmReturnOpen) {
            updateModalState({ isConfirmReturnOpen: false })
            return
        }
        onClose()
    }, [isConfirmReturnOpen, isSendReminderOpen, onClose, updateModalState])

    useEscapeKey(handleEscape)

    const handleOpenSendReminder = useCallback(() => {
        updateModalState({ isSendReminderOpen: true })
    }, [updateModalState])

    const handleCloseSendReminder = useCallback(() => {
        updateModalState({ isSendReminderOpen: false })
    }, [updateModalState])

    const handleOpenConfirmReturn = useCallback(() => {
        updateModalState({ isConfirmReturnOpen: true })
    }, [updateModalState])

    const handleCloseConfirmReturn = useCallback(() => {
        updateModalState({ isConfirmReturnOpen: false })
    }, [updateModalState])

    const handleReturnSuccess = useCallback(() => {
        updateModalState({ isConfirmReturnOpen: false })
        onReturnConfirmed()
        onClose()
    }, [onClose, onReturnConfirmed, updateModalState])

    return {
        isSendReminderOpen,
        isConfirmReturnOpen,
        handleOpenSendReminder,
        handleCloseSendReminder,
        handleOpenConfirmReturn,
        handleCloseConfirmReturn,
        handleReturnSuccess
    }
}

const getTransactionModalDetails = (booking) => {
    const variant = getTransactionVariant(booking)
    const equipments = booking.equipments || defaultList
    const equipment = equipments[0] || defaultBooking
    const user = booking.user || defaultBooking

    return {
        variant,
        equipmentTitle: equipment.name || 'Equipment',
        equipmentModel: equipment.model || '',
        equipmentSerial: equipment.serial_no || 'N/A',
        equipmentId: getEquipmentId(equipment, booking),
        borrowerName: user.full_name || 'Borrower',
        borrowerDepartment: user.department || 'BS Information Systems',
        startDateFormatted: formatDate(booking.start_date),
        endDateFormatted: formatDate(booking.end_date),
        overdueDuration: getOverdueDuration(booking.end_date),
        equipmentBadge: getEquipmentBadge(variant),
        timelineColor: getTimelineColor(variant),
        statusBadge: getStatusBadge(variant)
    }
}

export const TransactionDetailsModal = (props) => {
    const isOpen = props.isOpen || false
    const onClose = props.onClose || noop
    const booking = props.booking || defaultBooking
    const onReturnConfirmed = props.onReturnConfirmed || noop

    const {
        isSendReminderOpen,
        isConfirmReturnOpen,
        handleOpenSendReminder,
        handleCloseSendReminder,
        handleOpenConfirmReturn,
        handleCloseConfirmReturn,
        handleReturnSuccess
    } = useTransactionModalState(onClose, onReturnConfirmed)

    if (!isOpen || !booking.id) {
        return null
    }

    const {
        variant,
        equipmentTitle,
        equipmentModel,
        equipmentSerial,
        equipmentId,
        borrowerName,
        borrowerDepartment,
        startDateFormatted,
        endDateFormatted,
        overdueDuration,
        equipmentBadge,
        timelineColor,
        statusBadge
    } = getTransactionModalDetails(booking)

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <button
                    type="button"
                    aria-label="Close dialog"
                    tabIndex={-1}
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
                    onClick={onClose}
                />
                <div className="bg-slate-50 rounded-2xl border border-slate-300 w-full max-w-[760px] lg:max-w-[820px] max-h-[88dvh] overflow-y-scroll my-auto shadow-2xl font-['Poppins'] flex flex-col relative z-10">
                    <ModalHeader
                        equipmentTitle={equipmentTitle}
                        equipmentBadge={equipmentBadge}
                        equipmentModel={equipmentModel}
                        equipmentSerial={equipmentSerial}
                        onClose={onClose}
                    />

                    <ActivityLogSection
                        equipmentId={equipmentId}
                        timelineColor={timelineColor}
                        booking={booking}
                        borrowerName={borrowerName}
                        borrowerDepartment={borrowerDepartment}
                        statusBadge={statusBadge}
                        startDateFormatted={startDateFormatted}
                        endDateFormatted={endDateFormatted}
                        variant={variant}
                        overdueDuration={overdueDuration}
                    />

                    {variant === 'overdue' && (
                        <div className="px-4 py-5 sm:px-8 sm:py-6 bg-slate-50 flex flex-col items-center gap-4 shrink-0">
                            <button
                                type="button"
                                onClick={handleOpenSendReminder}
                                className="w-full sm:w-auto h-12 px-6 bg-sky-800 hover:bg-sky-900 transition-colors rounded-lg text-white text-base font-medium inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                                <Mail size={18} />
                                <span>Send Reminder Again</span>
                            </button>

                            <div className="text-xs sm:text-sm font-medium text-slate-700 flex flex-wrap justify-center items-center gap-1.5">
                                <span>Has the equipment been returned?</span>
                                <button
                                    type="button"
                                    onClick={handleOpenConfirmReturn}
                                    className="text-blue-600 hover:underline font-semibold cursor-pointer">
                                    Confirm here
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SendReminderModal isOpen={isSendReminderOpen} onClose={handleCloseSendReminder} booking={booking} />

            <ConfirmReturnModal
                key={`return-${isConfirmReturnOpen ? booking?.id : 'closed'}`}
                isOpen={isConfirmReturnOpen}
                onClose={handleCloseConfirmReturn}
                booking={booking}
                onSuccess={handleReturnSuccess}
            />
        </>
    )
}
