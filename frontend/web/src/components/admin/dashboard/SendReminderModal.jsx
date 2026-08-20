import { useCallback } from 'react'
import { formatDate } from '@shared/util/date'
import { getFullName } from '@shared/util/name'
import { getEquipmentTitle } from '@shared/util/equipment'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { bookingService } from '@/api'
import { ReminderSuccessView } from '@/components/admin/dashboard/ReminderSuccessView'
import { ReminderPromptView } from '@/components/admin/dashboard/ReminderPromptView'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

export const SendReminderModal = ({ isOpen = false, onClose = noop, booking = defaultBooking }) => {
    const [reminderState, updateReminderState] = useSetState({
        sent: false,
        sentTimestamp: '',
        isSubmitting: false
    })
    const { sent, sentTimestamp, isSubmitting } = reminderState

    useEscapeKey(onClose)

    const handleClose = useCallback(() => {
        updateReminderState({ sent: false })
        onClose()
    }, [onClose, updateReminderState])

    const handleSendReminder = useCallback(async () => {
        if (isSubmitting || !booking || !booking.id) {
            return
        }
        updateReminderState({ isSubmitting: true })
        try {
            await bookingService.remind(booking.id)
            updateReminderState({
                sentTimestamp: formatDate(new Date()),
                sent: true
            })
        } catch (error) {
            console.error('Failed to send reminder:', error)
        } finally {
            updateReminderState({ isSubmitting: false })
        }
    }, [booking, isSubmitting, updateReminderState])

    if (!isOpen || !booking || !booking.id) {
        return null
    }

    const borrower = booking.user || defaultBooking
    const borrowerName = getFullName(borrower) || 'Borrower'
    const borrowerDepartment = borrower.department || 'BSIS'
    const equipments = booking.equipments || defaultList
    const equipment = equipments[0] || null
    const equipmentName = getEquipmentTitle(equipment)
    const dueDate = formatDate(booking.end_date)
    const recipientEmail = borrower.email || 'borrower@student.laverdad.edu.ph'

    if (sent) {
        return <ReminderSuccessView sentTimestamp={sentTimestamp} onClose={handleClose} />
    }

    return (
        <ReminderPromptView
            borrowerName={borrowerName}
            borrowerDepartment={borrowerDepartment}
            equipmentName={equipmentName}
            dueDate={dueDate}
            recipientEmail={recipientEmail}
            isSubmitting={isSubmitting}
            onClose={handleClose}
            onSend={handleSendReminder}
        />
    )
}
