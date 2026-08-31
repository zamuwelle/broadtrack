import { useCallback } from 'react'
import { formatDate, getOverdueDuration } from '@shared/util/date'
import { getFullName } from '@shared/util/name'
import { getEquipmentTitle } from '@shared/util/equipment'
import { getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { SendReminderModal } from '@/features/admin/transactions/components/SendReminderModal'
import { ConfirmReturnModal } from '@/features/admin/approvals/components/ConfirmReturnModal'
import { ModalHeader } from '@/features/borrow/components/ModalHeader'
import { ActivityLogSection } from '@/features/admin/transactions/components/ActivityLogSection'
import { OverdueFooterActions } from '@/features/admin/dashboard/components/OverdueFooterActions'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

const getTransactionVariant = (booking) => {
    const status = getBookingStatus(booking)
    if (status === 'rejected') {
        return 'rejected'
    }
    if (status === 'returned') {
        return 'completed'
    }
    return isBookingOverdue(booking) ? 'overdue' : 'active'
}

const getEquipmentBadge = (variant) => {
    if (variant === 'rejected') {
        return {
            label: 'Maintenance',
            className: 'bg-orange-50 border-amber-500 text-amber-500'
        }
    }
    if (variant === 'completed') {
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

    const variant = getTransactionVariant(booking)
    const equipments = booking.equipments || defaultList
    const equipment = equipments[0] || defaultBooking
    const equipmentTitle = getEquipmentTitle(equipment)
    const equipmentModel = equipment.model || 'N/A'
    const equipmentSerial = equipment.serial_no || 'N/A'
    const equipmentId = getEquipmentId(equipment, booking)

    const user = booking.user || defaultBooking
    const borrowerName = getFullName(user) || 'Borrower'
    const borrowerDepartment = user.department || 'BS Information Systems'
    const startDateFormatted = formatDate(booking.start_date)
    const endDateFormatted = formatDate(booking.end_date)
    const overdueDuration = getOverdueDuration(booking.end_date)

    const equipmentBadge = getEquipmentBadge(variant)
    const timelineColor = getTimelineColor(variant)
    const statusBadge = getStatusBadge(variant)

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
                        <OverdueFooterActions
                            onOpenSendReminder={handleOpenSendReminder}
                            onOpenConfirmReturn={handleOpenConfirmReturn}
                        />
                    )}
                </div>
            </div>

            <SendReminderModal isOpen={isSendReminderOpen} onClose={handleCloseSendReminder} booking={booking} />

            <ConfirmReturnModal
                isOpen={isConfirmReturnOpen}
                onClose={handleCloseConfirmReturn}
                booking={booking}
                onSuccess={handleReturnSuccess}
            />
        </>
    )
}
