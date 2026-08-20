export const getTodayDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const parseBookingDate = (dateValue) => {
    if (!dateValue) {
        return null
    }
    if (dateValue instanceof Date) {
        return dateValue
    }
    const cleaned = String(dateValue).replace('Z', '').replace('T', ' ')
    const [datePart, timePart = '00:00'] = cleaned.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours = 0, minutes = 0] = timePart.split(':').map(Number)
    const date = new Date(year, month - 1, day, hours, minutes)
    return Number.isNaN(date.getTime()) ? new Date(dateValue) : date
}

export const formatDate = (dateValue) => {
    const date = parseBookingDate(dateValue)
    if (!date || Number.isNaN(date.getTime())) {
        return String(dateValue ?? '')
    }
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
    return `${month} ${date.getDate()}, ${date.getFullYear()}, ${time}`
}

export const formatShortDate = (dateValue) => {
    if (!dateValue) {
        return ''
    }
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
        return ''
    }
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`
}

export const formatSimpleDate = (dateValue) => {
    if (!dateValue) {
        return '---'
    }
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
        return '---'
    }
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

export const formatDateTime = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : null
    if (!date || Number.isNaN(date.getTime())) {
        return '---'
    }
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`
}

export const formatDateRange = (startDate, endDate) => {
    if (!startDate) {
        return '---'
    }
    const start = new Date(startDate)
    if (Number.isNaN(start.getTime())) {
        return '---'
    }
    if (!endDate) {
        return formatSimpleDate(startDate)
    }

    const end = new Date(endDate)
    if (Number.isNaN(end.getTime())) {
        return formatSimpleDate(startDate)
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    if (startMonth === endMonth && startYear === endYear) {
        if (start.getDate() === end.getDate()) {
            return `${startMonth} ${start.getDate()}, ${startYear}`
        }
        return `${startMonth} ${start.getDate()}-${end.getDate()}, ${startYear}`
    }
    return `${startMonth} ${start.getDate()}, ${startYear} – ${endMonth} ${end.getDate()}, ${endYear}`
}

export const getOverdueDuration = (endDate) => {
    if (!endDate) {
        return '0 minutes'
    }
    const diff = Date.now() - new Date(endDate).getTime()
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
