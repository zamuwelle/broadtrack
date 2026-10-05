import { formatBookingTimeRange, formatDate, parseBookingDate } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'

export const isBookedStatus = (status) => status === 'approved'
const hasEquipment = (equipments, id) => equipments?.some((item) => item.id === id) ?? false
export const hasEquipmentOverlap = (booking, selectedItems) =>
    selectedItems.some((selected) => hasEquipment(booking.equipments, selected.id))

const isOverlappingInterval = (booking, startDate, endDate) => {
    const bookingStart = parseBookingDate(booking.start_date)?.getTime()
    const bookingEnd = parseBookingDate(booking.end_date)?.getTime()
    const reqStart = parseBookingDate(startDate)?.getTime()
    const reqEnd = parseBookingDate(endDate)?.getTime()
    return Boolean(
        Number.isFinite(bookingStart) &&
        Number.isFinite(bookingEnd) &&
        Number.isFinite(reqStart) &&
        Number.isFinite(reqEnd) &&
        bookingStart < reqEnd &&
        reqStart < bookingEnd
    )
}

const isMatchingBooking = (booking, selectedItems, startDate, endDate) =>
    isBookedStatus(getBookingStatus(booking)) &&
    hasEquipmentOverlap(booking, selectedItems) &&
    isOverlappingInterval(booking, startDate, endDate)

const inspectBookingConflict = (booking, requestedStart, requestedEnd) => {
    const bookingStart = parseBookingDate(booking.start_date)?.getTime()
    const bookingEnd = parseBookingDate(booking.end_date)?.getTime()
    const valid = Number.isFinite(bookingStart) && Number.isFinite(bookingEnd)
    return {
        startIn: valid && requestedStart >= bookingStart && requestedStart < bookingEnd,
        endIn: valid && requestedEnd > bookingStart && requestedEnd <= bookingEnd,
        wraps: valid && requestedStart < bookingStart && requestedEnd > bookingEnd
    }
}

const getConflictMessage = (hasScheduleConflict, conflictingBooking) => {
    if (!hasScheduleConflict) {
        return ''
    }
    if (conflictingBooking) {
        const range = formatBookingTimeRange(conflictingBooking.start_date, conflictingBooking.end_date)
        if (range) {
            return `Already booked (${range}).`
        }
    }
    return 'Selected date conflicts with an existing reservation.'
}

const scanOverlappingBookings = ({
    remoteBookings,
    selectedItems,
    startDate,
    endDate,
    requestedStart,
    requestedEnd
}) => {
    let startIn = false
    let endIn = false
    let wraps = false
    let conflictingBooking = null
    const conflictMessages = new Set()

    for (const booking of remoteBookings) {
        if (isMatchingBooking(booking, selectedItems, startDate, endDate)) {
            conflictingBooking ||= booking
            const conflict = inspectBookingConflict(booking, requestedStart, requestedEnd)
            const messages = selectedItems
                .filter((item) => hasEquipment(booking.equipments, item.id))
                .map(
                    (item) =>
                        `${item.name}${item.serial_no ? ` (${item.serial_no})` : ''} is already booked from ${formatDate(booking.start_date)} to ${formatDate(booking.end_date)}.`
                )
            for (const message of messages) {
                conflictMessages.add(message)
            }
            startIn ||= conflict.startIn
            endIn ||= conflict.endIn
            wraps ||= conflict.wraps
        }
    }
    return { startIn, endIn, wraps, conflictingBooking, conflictMessages: [...conflictMessages] }
}

export const checkDateConflictBreakdown = ({ startDate, endDate, remoteBookings, selectedItems, minStartDate }) => {
    if (!startDate || !endDate) {
        return {
            hasStartConflict: false,
            hasEndConflict: false,
            hasScheduleConflict: false,
            conflictMessage: '',
            conflictMessages: []
        }
    }
    const requestedStart = parseBookingDate(startDate)?.getTime()
    const requestedEnd = parseBookingDate(endDate)?.getTime()
    const { startIn, endIn, wraps, conflictingBooking, conflictMessages } = scanOverlappingBookings({
        remoteBookings,
        selectedItems,
        startDate,
        endDate,
        requestedStart,
        requestedEnd
    })

    const hasStartConflict = Boolean((minStartDate && startDate < minStartDate) || startIn)
    const hasEndConflict = Boolean(endDate <= startDate || endIn || wraps)
    const hasScheduleConflict = Boolean(hasStartConflict || hasEndConflict)
    const conflictMessage = getConflictMessage(hasScheduleConflict, conflictingBooking)

    return { hasStartConflict, hasEndConflict, hasScheduleConflict, conflictMessage, conflictMessages }
}
