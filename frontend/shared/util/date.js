import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const PH_TIMEZONE = 'Asia/Manila'

export const getTodayDateString = () => dayjs().tz(PH_TIMEZONE).format('YYYY-MM-DD')

const toDayjsPh = (dateValue) => {
    if (!dateValue) {
        return null
    }
    if (dateValue instanceof Date) {
        if (Number.isNaN(dateValue.getTime())) {
            return null
        }
        return dayjs(dateValue).tz(PH_TIMEZONE)
    }
    const str = String(dateValue).trim()
    if (!str) {
        return null
    }
    if (str.includes('+') || str.includes('Z')) {
        const parsed = dayjs(str)
        return parsed.isValid() ? parsed.tz(PH_TIMEZONE) : null
    }
    const parsed = dayjs.tz(str.replace(' ', 'T'), PH_TIMEZONE)
    return parsed.isValid() ? parsed : null
}

export const parseBookingDate = (dateValue) => toDayjsPh(dateValue)?.toDate() ?? null

export const getBookingDateKey = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.format('YYYY-MM-DD') : ''
}

export const getBookingDateTimeValue = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.format('YYYY-MM-DDTHH:mm') : ''
}

export const getCurrentBookingDateTimeValue = (date = new Date()) => getBookingDateTimeValue(date)

export const addBookingMinutes = (dateValue, minutesToAdd) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.add(minutesToAdd, 'minute').format('YYYY-MM-DDTHH:mm') : ''
}

export const getNextBookingHourValue = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.startOf('hour').add(1, 'hour').format('YYYY-MM-DDTHH:mm') : ''
}

export const formatBookingTimeRange = (startDate, endDate) => {
    const parsedStart = toDayjsPh(startDate)
    const parsedEnd = toDayjsPh(endDate)
    if (!parsedStart || !parsedEnd) {
        return ''
    }
    return `${parsedStart.format('hh:mm A')} - ${parsedEnd.format('hh:mm A')}`
}

export const formatDate = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    if (!parsed) {
        return String(dateValue ?? '')
    }
    return parsed.format('MMMM D, YYYY, hh:mm A')
}

export const formatShortDate = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.format('MM-DD-YYYY') : ''
}

export const formatSimpleDate = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.format('MMMM D, YYYY') : '---'
}

export const formatDateTime = (dateValue) => {
    const parsed = toDayjsPh(dateValue)
    return parsed ? parsed.format('MM/DD/YYYY hh:mm:ss A') : '---'
}

export const getOverdueDuration = (endDate) => {
    const parsedEnd = parseBookingDate(endDate)
    if (!parsedEnd || Number.isNaN(parsedEnd.getTime())) {
        return '0 minutes'
    }
    const diff = Date.now() - parsedEnd.getTime()
    if (diff <= 0) {
        return '0 minutes'
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}${hours > 0 ? `, ${hours} hour${hours > 1 ? 's' : ''}` : ''}`
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? `, ${minutes} min` : ''}`
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

export const formatRelativeTime = (dateValue) => {
    const parsedDate = parseBookingDate(dateValue)
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return ''
    }
    const diffMs = Date.now() - parsedDate.getTime()
    const seconds = Math.max(0, Math.floor(diffMs / 1000))
    if (seconds < 60) {
        return 'Just now'
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return `${hours} hr${hours > 1 ? 's' : ''} ago`
    }
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Yesterday' : `${days} days ago`
}
