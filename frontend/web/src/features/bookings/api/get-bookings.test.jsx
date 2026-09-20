import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { getBookings, getBookingsQueryOptions, useBookings } from '@/features/bookings/api/get-bookings'

vi.mock('@/lib/api-client', () => ({
    api: { get: vi.fn() }
}))

const QueryWrapper = ({ children }) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('booking queries', () => {
    it('requests bookings with params and returns the response data', async () => {
        api.get.mockResolvedValue({ data: [{ id: 1 }] })

        await expect(getBookings({ status: 'pending' })).resolves.toEqual([{ id: 1 }])
        expect(api.get).toHaveBeenCalledWith('/bookings', { params: { status: 'pending' } })
    })

    it('keeps the base query key when no params are supplied', () => {
        expect(getBookingsQueryOptions().queryKey).toEqual(['bookings'])
        expect(getBookingsQueryOptions({ status: 'pending' }).queryKey).toEqual([
            'bookings',
            { status: 'pending' }
        ])
    })

    it('exposes fetched bookings through the query hook', async () => {
        api.get.mockResolvedValue({ data: [{ id: 2 }] })

        const { result } = renderHook(() => useBookings(), { wrapper: QueryWrapper })

        await waitFor(() => expect(result.current.data).toEqual([{ id: 2 }]))
    })
})
