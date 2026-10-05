import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { useBorrowSummaryLogic } from '@/features/borrow/request/useBorrowSummaryLogic'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

vi.mock('@/lib/auth', () => ({ useUser: () => ({}) }))
vi.mock('@/features/bookings/api/get-bookings', () => ({ useBookings: () => ({ data: [] }) }))
vi.mock('@/features/bookings/api/create-booking', () => ({ useCreateBooking: () => ({ isPending: false }) }))
vi.mock('@/hooks/ui/useToast', () => ({ useToast: () => ({ show: vi.fn() }) }))

afterEach(() => {
    useBookingCartStore.setState({ items: [] })
    vi.useRealTimers()
})

it('does not show a conflict while automatic dates update at the next minute', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T10:00:59+08:00'))
    useBookingCartStore.setState({ items: [{ id: 42, name: 'Camera', status: 'available' }] })
    const renders = []
    const { result } = renderHook(() => {
        const state = useBorrowSummaryLogic({ isOpen: true })
        renders.push(state.hasStartConflict)
        return state
    })
    renders.length = 0
    act(() => vi.advanceTimersByTime(1000))
    expect(renders).not.toContain(true)
    expect(result.current.startDate).toBe('2026-10-26T10:01')
})

it('still marks a manually chosen start time when it becomes past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T10:00:59+08:00'))
    useBookingCartStore.setState({ items: [{ id: 42, name: 'Camera', status: 'available' }] })
    const { result } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))
    act(() => result.current.handleStartDateChange('2026-10-26T10:00'))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.hasStartConflict).toBe(true)
})
