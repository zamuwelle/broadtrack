export const getBookingStatus = (booking) => {
    if (!booking) {
        return ''
    }
    if (typeof booking !== 'object') {
        return String(booking).toLowerCase()
    }
    const { status } = booking
    const statusValue = status && typeof status === 'object' ? status.value : status
    return String(statusValue || '').toLowerCase()
}

export const isBookingOverdue = (booking = {}) => {
    const status = getBookingStatus(booking)
    const endDate = booking.end_date
    return status === 'overdue' || (status === 'released' && Boolean(endDate) && new Date(endDate) < new Date())
}

export const getBookingStatusBadge = (booking = {}) => {
    const status = getBookingStatus(booking)
    if (isBookingOverdue(booking)) {
        return { label: 'Overdue', variant: 'overdue' }
    }
    if (status === 'returned') {
        return { label: 'Completed', variant: 'completed' }
    }
    if (status === 'rejected') {
        return { label: 'Rejected', variant: 'rejected' }
    }
    return { label: 'Confirmed', variant: 'confirmed' }
}

export const resolveBookingScheduleStatus = (booking = {}) => {
    const status = getBookingStatus(booking)
    return status === 'pending' || status === 'rejected' || status === 'cancelled' ? status : 'active'
}
