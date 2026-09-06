import { api } from '@/lib/api-client'

const triggerDownload = (data, defaultFilename) => {
    const blob = data instanceof Blob ? data : new Blob([data])
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = defaultFilename
    document.body.append(link)
    link.click()
    link.remove()
    globalThis.URL.revokeObjectURL(url)
}

export const exportTransactionsPdf = async ({ category = 'All', search = '' } = {}) => {
    const data = await api.get('/bookings/reports/pdf', {
        params: { category, search },
        responseType: 'blob'
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    triggerDownload(data, `transactions-report-${dateStr}.pdf`)
}

export const exportTransactionsCsv = async ({ category = 'All', search = '' } = {}) => {
    const data = await api.get('/bookings/reports/csv', {
        params: { category, search },
        responseType: 'blob'
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    triggerDownload(data, `transactions-report-${dateStr}.csv`)
}
