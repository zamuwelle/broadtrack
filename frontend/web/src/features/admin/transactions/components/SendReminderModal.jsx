import { useCallback } from 'react'
import { formatDate } from '@shared/util/date'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useSetState } from '@shared/hooks/useSetState'
import { useToast } from '@/hooks/ui/useToast'
import { useRemindBooking } from '@/features/bookings/api/remind-booking'
import { ReminderSuccessView } from '@/features/admin/transactions/components/ReminderSuccessView'
import { ReminderPromptView } from '@/features/admin/transactions/components/ReminderPromptView'

const defaultBooking = Object.freeze({})
const defaultList = Object.freeze([])
const noop = () => null

const getReminderModalDetails = (booking) => {
    const borrower = booking.user || defaultBooking
    const equipments = booking.equipments || defaultList
    const equipment = equipments[0] || null
    return {
        borrowerName: borrower.full_name || 'Borrower',
        borrowerDepartment: borrower.department || 'BSIS',
        equipmentName: equipment?.name || 'Equipment',
        dueDate: formatDate(booking.end_date),
        recipientEmail: borrower.email || 'borrower@student.laverdad.edu.ph'
    }
}

export const SendReminderModal = ({ isOpen = false, onClose = noop, booking = defaultBooking }) => {
    const remindMutation = useRemindBooking()
    const { show: showToast } = useToast()
    const [reminderState, updateReminderState] = useSetState({
        sent: false,
        sentTimestamp: '',
        errorMessage: ''
    })
    const isSubmitting = remindMutation.isPending
    const { sent, sentTimestamp, errorMessage } = reminderState

    useEscapeKey(onClose)

    const handleClose = useCallback(() => {
        updateReminderState({ sent: false, errorMessage: '' })
        onClose()
    }, [onClose, updateReminderState])

    const handleSendReminder = useCallback(async () => {
        if (isSubmitting || !booking || !booking.id) {
            return
        }
        updateReminderState({ errorMessage: '' })
        try {
            await remindMutation.mutateAsync(booking.id)
            updateReminderState({
                sentTimestamp: formatDate(new Date()),
                sent: true
            })
        } catch (error) {
            const message = (error && error.message) || 'Failed to send reminder.'
            updateReminderState({
                errorMessage: message
            })
            showToast(message, 'danger')
        }
    }, [booking, isSubmitting, remindMutation, showToast, updateReminderState])

    if (!isOpen || !booking || !booking.id) {
        return null
    }

    const { borrowerName, borrowerDepartment, equipmentName, dueDate, recipientEmail } =
        getReminderModalDetails(booking)

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
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onClose={handleClose}
            onSend={handleSendReminder}
        />
    )
}
