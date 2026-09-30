import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { downloadBookingSlip } from '@/features/bookings/api/download-slip'
import { exportTransactionsCsv, exportTransactionsPdf } from '@/features/bookings/api/export-transactions'

vi.mock('@/lib/api-client', () => ({ api: { get: vi.fn() } }))

const originalCreateObjectURL = globalThis.URL.createObjectURL
const originalRevokeObjectURL = globalThis.URL.revokeObjectURL

const jsonBlob = (text) => {
    const blob = new Blob([text], { type: 'application/json' })
    blob.text = () => Promise.resolve(text)
    return blob
}

describe('booking downloads', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:test')
        globalThis.URL.revokeObjectURL = vi.fn()
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.clearAllMocks()
        globalThis.URL.createObjectURL = originalCreateObjectURL
        globalThis.URL.revokeObjectURL = originalRevokeObjectURL
        vi.useRealTimers()
        document.body.replaceChildren()
    })

    it.each([
        [
            'slip',
            () => downloadBookingSlip({ bookingId: 7, ticketId: 'T-7' }),
            '/bookings/7/slip',
            'borrowing-slip-T-7.pdf'
        ],
        [
            'PDF',
            () => exportTransactionsPdf({ category: 'Active', search: 'camera' }),
            '/bookings/reports/pdf',
            'transactions-report-2026-10-28.pdf'
        ],
        [
            'CSV',
            () => exportTransactionsCsv({ category: 'Active', search: 'camera' }),
            '/bookings/reports/csv',
            'transactions-report-2026-10-28.csv'
        ]
    ])('downloads %s and cleans up its object URL', async (_name, download, path, filename) => {
        api.get.mockResolvedValueOnce(new Blob(['data'], { type: 'application/octet-stream' }))
        await download()
        expect(api.get.mock.calls[0][0]).toBe(path)
        expect(document.querySelector('a').download).toBe(filename)
        vi.runAllTimers()
        expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
        expect(document.querySelector('a')).toBeNull()
    })

    it('reports a JSON error returned as a successful blob', async () => {
        api.get.mockResolvedValueOnce(jsonBlob('{"message":"Not allowed"}'))
        await expect(downloadBookingSlip({ bookingId: 7 })).rejects.toThrow('Not allowed')
    })

    it('uses the fallback when an error blob contains malformed JSON', async () => {
        api.get.mockRejectedValueOnce({ response: { data: jsonBlob('{') }, message: 'Request failed' })
        await expect(exportTransactionsCsv()).rejects.toThrow('Request failed')
    })
})
