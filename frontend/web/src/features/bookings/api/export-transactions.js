import { api } from '@/lib/api-client'

const triggerDownload = (data, defaultFilename, mimeType) => {
    const blob = data instanceof Blob && data.type ? data : new Blob([data], { type: mimeType })
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = defaultFilename
    document.body.append(link)
    link.click()
    globalThis.setTimeout(() => {
        link.remove()
        globalThis.URL.revokeObjectURL(url)
    }, 1000)
}

export const exportTransactionsPdf = async ({ category = 'All', search = '' } = {}) => {
    const data = await api.get('/bookings/reports/pdf', {
        params: { category, search },
        responseType: 'blob'
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    triggerDownload(data, `transactions-report-${dateStr}.pdf`, 'application/pdf')
}

export const exportTransactionsCsv = async ({ category = 'All', search = '' } = {}) => {
    const data = await api.get('/bookings/reports/csv', {
        params: { category, search },
        responseType: 'blob'
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    triggerDownload(data, `transactions-report-${dateStr}.csv`, 'text/csv;charset=utf-8')
}
