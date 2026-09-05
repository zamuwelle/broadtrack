export const matchesSearch = (equipment = {}, query = '') => {
    const normalizedQuery = (query || '').trim().toLowerCase()
    if (!normalizedQuery) {
        return true
    }
    const content =
        `${equipment.name || ''} ${equipment.brand ?? ''} ${equipment.model ?? ''} ${equipment.serial_no ?? ''}`.toLowerCase()
    return normalizedQuery.split(/\s+/u).every((term) => content.includes(term))
}

export const matchesBookingSearch = (booking = {}, query = '') => {
    const normalizedQuery = (query || '').trim().toLowerCase()
    if (!normalizedQuery) {
        return true
    }
    const equipments = booking.equipments || []
    const equipmentFields = equipments.flatMap((item) => [item.name, item.model, item.serial_no, item.brand])
    const fields = [
        ...equipmentFields,
        booking.ticket_id,
        String(booking.id ?? ''),
        booking.user ? booking.user.full_name : '',
        booking.user ? booking.user.email : '',
        booking.purpose
    ]
    return fields.some((field) => field && field.toLowerCase().includes(normalizedQuery))
}

export const matchesUserSearch = (user = {}, query = '') => {
    const normalizedQuery = (query || '').trim().toLowerCase()
    if (!normalizedQuery) {
        return true
    }
    return [
        user ? user.full_name : '',
        user ? user.firstname : '',
        user ? user.lastname : '',
        user ? user.email : '',
        user ? user.role : '',
        user ? user.department : ''
    ].some((field) => field && field.toLowerCase().includes(normalizedQuery))
}
