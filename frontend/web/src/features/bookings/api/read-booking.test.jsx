import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vite-plus/test'
import { useMarkBookingAsRead } from '@/features/bookings/api/read-booking'
import { api } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({ api: { put: vi.fn() } }))

it('keeps a notification unread when marking it as read fails', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    client.setQueryData(['bookings'], [{ id: 1, is_read: false }])
    api.put.mockRejectedValueOnce(new Error('Network Error'))
    const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
    const { result } = renderHook(() => useMarkBookingAsRead(), { wrapper })
    await act(async () => {
        await expect(result.current.mutateAsync(1)).rejects.toMatchObject({ message: 'Network Error' })
    })
    expect(client.getQueryData(['bookings'])[0].is_read).toBe(false)
})

it('marks a notification as read after the server accepts it', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    client.setQueryData(['bookings'], [{ id: 1, is_read: false }])
    api.put.mockResolvedValueOnce({})
    const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
    const { result } = renderHook(() => useMarkBookingAsRead(), { wrapper })
    await act(async () => { await result.current.mutateAsync(1) })
    expect(client.getQueryData(['bookings'])[0].is_read).toBe(true)
})
