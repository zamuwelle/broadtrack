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

export const isBookingOverdue = (booking = {}) => Boolean(booking?.is_overdue)

export const getBookingStatusBadge = (booking = {}) => {
    const status = getBookingStatus(booking)
    if (booking.is_overdue) {
        return { label: 'Overdue', variant: 'overdue' }
    }
    if (status === 'returned') {
        return { label: 'Completed', variant: 'completed' }
    }
    if (status === 'rejected') {
        return { label: 'Rejected', variant: 'rejected' }
    }
    if (status === 'cancelled' || status === 'canceled') {
        return { label: 'Cancelled', variant: 'cancelled' }
    }
    return { label: 'Confirmed', variant: 'confirmed' }
}

export const resolveBookingScheduleStatus = (booking = {}) => {
    const status = getBookingStatus(booking)
    return status === 'pending' || status === 'rejected' || status === 'cancelled' ? status : 'active'
}

export const flattenBookingsByEquipment = (bookings) =>
    bookings.flatMap((booking) => {
        const equipments = booking.equipments || []
        if (equipments.length <= 1) {
            return [booking]
        }
        const flattened = []
        for (const equipment of equipments) {
            flattened.push({
                ...booking,
                itemKey: `${booking.id}-${equipment.id}`,
                equipment,
                equipments: [equipment]
            })
        }
        return flattened
    })
