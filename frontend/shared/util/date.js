const PH_TIMEZONE = 'Asia/Manila'

export const getTodayDateString = () => new Intl.DateTimeFormat('en-CA', { timeZone: PH_TIMEZONE }).format(new Date())

const normalizeIsoString = (isoWithT) => {
    if (isoWithT.length === 16) {
        return `${isoWithT}:00+08:00`
    }
    if (isoWithT.length === 19) {
        return `${isoWithT}+08:00`
    }
    return isoWithT
}

export const parseBookingDate = (dateValue) => {
    if (!dateValue) {
        return null
    }
    if (dateValue instanceof Date) {
        return dateValue
    }
    const str = String(dateValue).trim()
    if (str.includes('+') || str.includes('Z')) {
        return new Date(str)
    }
    const isoWithT = str.replace(' ', 'T')
    const normalized = normalizeIsoString(isoWithT)
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? new Date(str) : date
}

export const formatDate = (dateValue) => {
    const date = parseBookingDate(dateValue)
    if (!date || Number.isNaN(date.getTime())) {
        return String(dateValue ?? '')
    }
    const month = date.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, month: 'long' })
    const day = date.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, day: 'numeric' })
    const year = date.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, year: 'numeric' })
    const time = date.toLocaleTimeString('en-US', {
        timeZone: PH_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
    return `${month} ${day}, ${year}, ${time}`
}

export const formatShortDate = (dateValue) => {
    const date = parseBookingDate(dateValue)
    if (!date || Number.isNaN(date.getTime())) {
        return ''
    }
    return new Intl.DateTimeFormat('en-US', {
        timeZone: PH_TIMEZONE,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
        .format(date)
        .replaceAll('/', '-')
}

export const formatSimpleDate = (dateValue) => {
    const date = parseBookingDate(dateValue)
    if (!date || Number.isNaN(date.getTime())) {
        return '---'
    }
    return date.toLocaleDateString('en-US', {
        timeZone: PH_TIMEZONE,
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

export const formatDateTime = (dateValue) => {
    const date = parseBookingDate(dateValue)
    if (!date || Number.isNaN(date.getTime())) {
        return '---'
    }
    const datePart = new Intl.DateTimeFormat('en-US', {
        timeZone: PH_TIMEZONE,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }).format(date)
    const timePart = date.toLocaleTimeString('en-US', {
        timeZone: PH_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    })
    return `${datePart} ${timePart}`
}

export const formatDateRange = (startDate, endDate) => {
    const start = parseBookingDate(startDate)
    if (!start || Number.isNaN(start.getTime())) {
        return '---'
    }
    if (!endDate) {
        return formatSimpleDate(startDate)
    }

    const end = parseBookingDate(endDate)
    if (!end || Number.isNaN(end.getTime())) {
        return formatSimpleDate(startDate)
    }

    const startMonth = start.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, month: 'long' })
    const endMonth = end.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, month: 'long' })
    const startYear = start.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, year: 'numeric' })
    const endYear = end.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, year: 'numeric' })
    const startDay = start.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, day: 'numeric' })
    const endDay = end.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE, day: 'numeric' })

    if (startMonth === endMonth && startYear === endYear) {
        if (startDay === endDay) {
            return `${startMonth} ${startDay}, ${startYear}`
        }
        return `${startMonth} ${startDay}-${endDay}, ${startYear}`
    }
    return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`
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
