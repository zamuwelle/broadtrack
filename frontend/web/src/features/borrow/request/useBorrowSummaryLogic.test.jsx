import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useBorrowSummaryLogic } from '@/features/borrow/request/useBorrowSummaryLogic'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

let currentMockBookings = []

vi.mock('@/lib/auth', () => ({
    useUser: () => ({ data: { id: 1, full_name: 'Test Borrower' } })
}))

vi.mock('@/features/bookings/api/get-bookings', () => ({
    useBookings: () => ({ data: currentMockBookings, isLoading: false })
}))

vi.mock('@/features/bookings/api/create-booking', () => ({
    useCreateBooking: () => ({ mutateAsync: vi.fn(), isPending: false })
}))

vi.mock('@/hooks/ui/useToast', () => ({
    useToast: () => ({ show: vi.fn(), hide: vi.fn() })
}))

describe('useBorrowSummaryLogic', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-10-26T10:00:00+08:00'))
        currentMockBookings = []
        useBookingCartStore.setState({
            items: [{ id: 42, name: 'Sony FX3', brand: 'Sony', model: 'FX3', status: 'available' }]
        })
    })

    afterEach(() => {
        useBookingCartStore.setState({ items: [] })
        currentMockBookings = []
        vi.useRealTimers()
    })

    it('immediately surfaces schedule conflict message on render when default dates overlap an approved booking', () => {
        currentMockBookings = [
            {
                id: 101,
                status: 'approved',
                start_date: '2026-10-26T00:00:00+08:00',
                end_date: '2026-10-26T23:59:59+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        expect(result.current.hasScheduleConflict).toBe(true)
        expect(result.current.errorMessage).toBe('Selected date conflicts with an existing reservation.')
        expect(result.current.isSubmittable).toBe(false)

        act(() => {
            unmount()
        })
    })

    it('does not display conflict error message when there is no overlapping reservation', () => {
        currentMockBookings = [
            {
                id: 102,
                status: 'approved',
                start_date: '2026-10-27T10:00:00+08:00',
                end_date: '2026-10-27T12:00:00+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        expect(result.current.hasScheduleConflict).toBe(false)
        expect(result.current.errorMessage).toBe('')

        act(() => {
            unmount()
        })
    })
})
