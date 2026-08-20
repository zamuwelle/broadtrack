import { getFullName } from '@shared/util/name'
import { getEquipmentTitle } from '@shared/util/equipment'

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
    const equipment = booking.equipments ? booking.equipments[0] : null
    const fields = [
        getEquipmentTitle(equipment),
        equipment ? equipment.model : '',
        booking.ticket_id,
        String(booking.id ?? ''),
        getFullName(booking.user),
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
        getFullName(user),
        user ? user.firstname : '',
        user ? user.lastname : '',
        user ? user.email : '',
        user ? user.role : '',
        user ? user.department : ''
    ].some((field) => field && field.toLowerCase().includes(normalizedQuery))
}
