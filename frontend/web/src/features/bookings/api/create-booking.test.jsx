import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { createBooking, useCreateBooking } from '@/features/bookings/api/create-booking'

vi.mock('@/lib/api-client', () => ({
    api: { post: vi.fn() }
}))

describe('create booking mutation', () => {
    it('posts the booking payload', async () => {
        const payload = { equipment_ids: [1], starts_at: '2026-10-26T09:00' }
        api.post.mockResolvedValue({ data: { id: 1 } })

        await expect(createBooking(payload)).resolves.toEqual({ data: { id: 1 } })
        expect(api.post).toHaveBeenCalledWith('/bookings', payload)
    })

    it('invalidates booking and equipment queries after success', async () => {
        const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
        const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
        api.post.mockResolvedValue({ data: { id: 1 } })
        const { result } = renderHook(() => useCreateBooking(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        })

        result.current.mutate({ equipment_ids: [1] })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bookings'] })
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['equipment'] })
    })
})
