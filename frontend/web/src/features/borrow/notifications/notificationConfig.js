import { getBookingStatus } from '@shared/util/booking'

export const getNotificationConfig = (booking = {}) => {
    const status = getBookingStatus(booking)
    if (status === 'approved') {
        return {
            filterStatus: 'Approved',
            icon: 'notificationApproved',
            headline: 'Request approved',
            details: `Your request ${booking.ticket_id ?? ''} has been approved.`
        }
    }
    if (status === 'rejected') {
        return {
            filterStatus: 'Rejected',
            icon: 'notificationRejected',
            headline: 'Request rejected',
            details: `Your request ${booking.ticket_id ?? ''} was rejected.`
        }
    }
    if (status === 'returned') {
        return {
            filterStatus: 'Returned',
            icon: 'notificationReturned',
            headline: 'Equipment returned',
            details: 'Your equipment return has been confirmed.'
        }
    }
    return null
}
