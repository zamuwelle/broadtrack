import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { approveBooking, useApproveBooking } from '@/features/bookings/api/approve-booking'

vi.mock('@/lib/api-client', () => ({
    api: { put: vi.fn() }
}))

describe('approve booking mutation', () => {
    it('approves a booking with its id and payload', async () => {
        api.put.mockResolvedValue({ data: { id: 7, status: 'approved' } })

        await expect(approveBooking({ bookingId: 7, data: { starts_at: '2026-10-26T09:00' } })).resolves.toEqual({
            data: { id: 7, status: 'approved' }
        })
        expect(api.put).toHaveBeenCalledWith('/bookings/7/approve', { starts_at: '2026-10-26T09:00' })
    })

    it('invalidates booking and equipment queries after approval', async () => {
        const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
        api.put.mockResolvedValue({ data: { id: 7 } })
        const { result } = renderHook(() => useApproveBooking(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        })

        result.current.mutate({ bookingId: 7 })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bookings'] })
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['equipment'] })
    })
})
