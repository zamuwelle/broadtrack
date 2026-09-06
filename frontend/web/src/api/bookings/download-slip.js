import { api } from '@/lib/api-client'

export const downloadBookingSlip = async ({ bookingId, ticketId = 'slip' } = {}) => {
    const data = await api.get(`/bookings/${bookingId}/slip/pdf`, {
        responseType: 'blob'
    })
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' })
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `borrowing-slip-${ticketId}.pdf`
    document.body.append(link)
    link.click()
    link.remove()
    globalThis.URL.revokeObjectURL(url)
}
