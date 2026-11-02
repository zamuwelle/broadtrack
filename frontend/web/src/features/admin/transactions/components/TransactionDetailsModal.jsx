import { useCallback, useMemo } from 'react'
import { formatDate, getOverdueDuration } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { SendReminderModal } from '@/features/admin/transactions/components/SendReminderModal'
import { ConfirmReturnModal } from '@/features/admin/approvals/components/ConfirmReturnModal'
import { ModalHeader } from '@/features/admin/transactions/components/ModalHeader'
import { ActivityLogSection } from '@/features/admin/transactions/components/ActivityLogSection'
import { useEquipment } from '@/features/equipment/api/get-equipment'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null
const getSelectedEquipmentId = (booking) => booking.equipments?.[0]?.id ?? booking.equipment_id

const getTransactionVariant = (booking) => {
    const status = getBookingStatus(booking)
    if (status === 'pending') {
        return 'pending'
    }
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

const equipmentBadges = Object.freeze({
    available: {
        label: 'Available',
        className: 'bg-green-100 border-green-500 text-green-500'
    },
    booked: {
        label: 'Booked',
        className: 'bg-rose-100 border-rose-500 text-rose-500'
    },
    borrowed: {
        label: 'Borrowed',
        className: 'bg-blue-200 border-sky-800 text-sky-800'
    },
    maintenance: {
        label: 'Maintenance',
        className: 'bg-orange-50 border-amber-500 text-amber-500'
    }
})

const getStatusBadge = (variant) => {
    if (variant === 'pending') {
        return { label: 'Pending', className: 'bg-amber-50 text-amber-600' }
    }
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
    if (variant === 'overdue' || variant === 'pending') {
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
    return ''
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
        timelineColor: getTimelineColor(variant),
        statusBadge: getStatusBadge(variant)
    }
}

export const TransactionDetailsModal = (props) => {
    const isOpen = props.isOpen || false
    const onClose = props.onClose || noop
    const booking = props.booking || defaultBooking
    const onReturnConfirmed = props.onReturnConfirmed || noop
    const bookings = props.bookings ?? defaultList
    const { data: equipmentList = defaultList } = useEquipment({
        queryConfig: { enabled: isOpen }
    })
    const entries = useMemo(() => {
        const selectedEquipmentId = getSelectedEquipmentId(booking)
        const history = selectedEquipmentId
            ? bookings.filter((item) => item.equipments?.some((equipment) => equipment.id === selectedEquipmentId))
            : [booking]
        return history
            .toSorted(
                (first, second) =>
                    Number(second.id === booking.id) - Number(first.id === booking.id) ||
                    new Date(second.start_date || second.created_at) - new Date(first.start_date || first.created_at)
            )
            .map((item) => {
                const details = getTransactionModalDetails(item)
                details.booking = item
                return details
            })
    }, [booking, bookings])

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

    const { variant, equipmentTitle, equipmentModel, equipmentSerial, equipmentId } =
        getTransactionModalDetails(booking)
    const selectedEquipmentId = getSelectedEquipmentId(booking)
    const currentEquipment = equipmentList.find((item) => item.id === selectedEquipmentId)
    const equipmentBadge = equipmentBadges[currentEquipment?.status]
    const fullBooking = bookings.find((item) => item.id === booking.id) || booking

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
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
                        entries={entries}
                        selectedId={variant === 'overdue' ? booking.id : null}
                        onReminder={handleOpenSendReminder}
                        onReturn={handleOpenConfirmReturn}
                    />
                </div>
            </div>

            <SendReminderModal isOpen={isSendReminderOpen} onClose={handleCloseSendReminder} booking={booking} />

            <ConfirmReturnModal
                key={`return-${isConfirmReturnOpen ? booking?.id : 'closed'}`}
                isOpen={isConfirmReturnOpen}
                onClose={handleCloseConfirmReturn}
                booking={fullBooking}
                onSuccess={handleReturnSuccess}
            />
        </>
    )
}
