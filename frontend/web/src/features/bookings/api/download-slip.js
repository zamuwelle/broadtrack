import { api } from '@/lib/api-client'

const parseBlobError = async (data, defaultMessage) => {
    if (!(data instanceof Blob) || !data.type.includes('application/json')) {
        return null
    }
    const text = await data.text()
    try {
        const parsed = JSON.parse(text)
        return parsed.message || defaultMessage
    } catch {
        return defaultMessage
    }
}

const triggerDownload = (blob, filename) => {
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    globalThis.setTimeout(() => {
        link.remove()
        globalThis.URL.revokeObjectURL(url)
    }, 1000)
}

export const downloadBookingSlip = async ({ bookingId, ticketId = 'slip' } = {}) => {
    let data
    try {
        data = await api.get(`/bookings/${bookingId}/slip`, {
            responseType: 'blob'
        })
    } catch (error) {
        const blobErrorMessage = await parseBlobError(
            error?.response?.data,
            error?.message || 'Failed to download booking slip'
        )
        throw new Error(blobErrorMessage || error?.message || 'Failed to download booking slip', { cause: error })
    }

    const errorMessage = await parseBlobError(data, 'Failed to download booking slip')
    if (errorMessage) {
        throw new Error(errorMessage)
    }

    const blob = data instanceof Blob && data.type ? data : new Blob([data], { type: 'application/pdf' })
    triggerDownload(blob, `borrowing-slip-${ticketId}.pdf`)
}
