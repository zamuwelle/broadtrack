import { api } from '@/lib/api-client'
import { parseBlobError } from '@/features/bookings/api/parse-blob-error'

const triggerDownload = async (data, defaultFilename, mimeType) => {
    const errorMessage = await parseBlobError(data, 'Failed to export transactions')
    if (errorMessage) {
        throw new Error(errorMessage)
    }

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
    let data
    try {
        data = await api.get('/bookings/reports/pdf', {
            params: { category, search },
            responseType: 'blob'
        })
    } catch (error) {
        const blobErrorMessage = await parseBlobError(
            error?.response?.data,
            error?.message || 'Failed to export transactions'
        )
        throw new Error(blobErrorMessage || error?.message || 'Failed to export transactions', { cause: error })
    }
    const dateStr = new Date().toISOString().slice(0, 10)
    await triggerDownload(data, `transactions-report-${dateStr}.pdf`, 'application/pdf')
}

export const exportTransactionsXlsx = async ({ category = 'All', search = '' } = {}) => {
    let data
    try {
        data = await api.get('/bookings/reports/xlsx', {
            params: { category, search },
            responseType: 'blob'
        })
    } catch (error) {
        const blobErrorMessage = await parseBlobError(
            error?.response?.data,
            error?.message || 'Failed to export transactions'
        )
        throw new Error(blobErrorMessage || error?.message || 'Failed to export transactions', { cause: error })
    }
    const dateStr = new Date().toISOString().slice(0, 10)
    await triggerDownload(data, `transactions-report-${dateStr}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}
