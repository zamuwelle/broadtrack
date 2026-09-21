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

    it('automatically defaults to minStartDate on open when an item has an ongoing approved reservation', () => {
        currentMockBookings = [
            {
                id: 101,
                status: 'approved',
                start_date: '2026-10-26T08:00:00+08:00',
                end_date: '2026-10-26T14:00:00+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        expect(result.current.minStartDate).toBe('2026-10-26T10:00')
        expect(result.current.startDate).toBe('2026-10-26T14:00')
        expect(result.current.endDate).toBe('2026-10-26T15:00')
        expect(result.current.hasStartConflict).toBe(false)
        expect(result.current.hasEndConflict).toBe(false)
        expect(result.current.hasScheduleConflict).toBe(false)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.helperMessage).toBe('Already booked (08:00 AM - 02:00 PM).')

        act(() => {
            unmount()
        })
    })

    it('sets hasStartConflict to true and hasEndConflict to false when startDate falls inside a future approved reservation', () => {
        currentMockBookings = [
            {
                id: 102,
                status: 'approved',
                start_date: '2026-10-27T14:00:00+08:00',
                end_date: '2026-10-27T16:00:00+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        act(() => {
            result.current.handleStartDateChange('2026-10-27T14:30')
        })
        act(() => {
            result.current.handleEndDateChange('2026-10-27T17:00')
        })

        expect(result.current.hasStartConflict).toBe(true)
        expect(result.current.hasEndConflict).toBe(false)
        expect(result.current.hasScheduleConflict).toBe(true)
        expect(result.current.errorMessage).toBe('Already booked (02:00 PM - 04:00 PM).')
        expect(result.current.isSubmittable).toBe(false)

        act(() => {
            unmount()
        })
    })

    it('sets hasStartConflict to false and hasEndConflict to true when endDate stretches into an approved reservation', () => {
        currentMockBookings = [
            {
                id: 102,
                status: 'approved',
                start_date: '2026-10-27T14:00:00+08:00',
                end_date: '2026-10-27T16:00:00+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        act(() => {
            result.current.handleStartDateChange('2026-10-27T13:00')
        })
        act(() => {
            result.current.handleEndDateChange('2026-10-27T15:00')
        })

        expect(result.current.hasStartConflict).toBe(false)
        expect(result.current.hasEndConflict).toBe(true)
        expect(result.current.hasScheduleConflict).toBe(true)
        expect(result.current.errorMessage).toBe('Already booked (02:00 PM - 04:00 PM).')
        expect(result.current.isSubmittable).toBe(false)

        act(() => {
            unmount()
        })
    })

    it('does not display conflict error message when there is no overlapping reservation', () => {
        currentMockBookings = [
            {
                id: 103,
                status: 'approved',
                start_date: '2026-10-27T10:00:00+08:00',
                end_date: '2026-10-27T12:00:00+08:00',
                equipments: [{ id: 42, name: 'Sony FX3' }]
            }
        ]

        const { result, unmount } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))

        expect(result.current.hasStartConflict).toBe(false)
        expect(result.current.hasEndConflict).toBe(false)
        expect(result.current.hasScheduleConflict).toBe(false)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.helperMessage).toBe('')

        act(() => {
            unmount()
        })
    })
})
