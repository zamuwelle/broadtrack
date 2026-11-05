import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { useBookingNotification } from '@/hooks/queries/useBookingNotification'

const { get, show, events } = vi.hoisted(() => ({ get: vi.fn(), show: vi.fn(), events: {} }))
vi.mock('@/lib/api-client', () => ({ api: { get } }))
vi.mock('@/lib/auth', () => ({ useUser: () => ({ data: { id: 1, role: 'borrower' } }) }))
vi.mock('@/hooks/ui/useToast', () => ({ useToast: () => ({ show }) }))
vi.mock('@/hooks/queries/useEvents', () => ({ useEvents: (handlers) => Object.assign(events, handlers) }))

afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
})

it('shows a toast when a booking notification request has a connection failure', async () => {
    vi.stubGlobal('Notification', { permission: 'granted' })
    get.mockRejectedValueOnce(new Error('Network Error'))
    renderHook(() => useBookingNotification())
    await act(() => events.onBookingNotification({ bookingId: 1 }))
    expect(show).toHaveBeenCalledWith('Network Error', 'danger')
})

it('does not show a server error toast for an HTTP validation failure', async () => {
    vi.stubGlobal('Notification', { permission: 'granted' })
    get.mockRejectedValueOnce(Object.assign(new Error('Invalid request'), { status: 422 }))
    renderHook(() => useBookingNotification())
    await act(() => events.onBookingNotification({ bookingId: 1 }))
    expect(show).not.toHaveBeenCalled()
})
