import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { useBorrowSummaryLogic } from '@/features/borrow/request/useBorrowSummaryLogic'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

vi.mock('@/lib/auth', () => ({ useUser: () => ({}) }))
vi.mock('@/features/bookings/api/create-booking', () => ({ useCreateBooking: () => ({ isPending: false }) }))
vi.mock('@/hooks/ui/useToast', () => ({ useToast: () => ({ show: vi.fn() }) }))
vi.mock('@/features/bookings/api/get-bookings', () => ({
    useBookings: () => ({
        data: [
            {
                id: 1,
                status: 'approved',
                start_date: '2026-10-27T14:00:00+08:00',
                end_date: '2026-10-27T16:00:00+08:00',
                equipments: [{ id: 1, name: 'Camera' }]
            },
            {
                id: 2,
                status: 'approved',
                start_date: '2026-10-27T14:00:00+08:00',
                end_date: '2026-10-27T16:00:00+08:00',
                equipments: [{ id: 2, name: 'Microphone' }]
            }
        ]
    })
}))

afterEach(() => {
    useBookingCartStore.setState({ items: [] })
    vi.useRealTimers()
})

it('lists each conflicting item once with its serial number and booking period', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T10:00:00+08:00'))
    useBookingCartStore.setState({
        items: [
            { id: 1, name: 'Camera', serial_no: 'CAM-1' },
            { id: 2, name: 'Microphone', serial_no: 'MIC-2' }
        ]
    })
    const { result } = renderHook(() => useBorrowSummaryLogic({ isOpen: true }))
    act(() => result.current.handleStartDateChange('2026-10-27T14:30'))
    act(() => result.current.handleEndDateChange('2026-10-27T15:00'))
    expect(result.current.conflictMessages).toEqual([
        'Camera (CAM-1) is already booked from October 27, 2026, 02:00 PM to October 27, 2026, 04:00 PM.',
        'Microphone (MIC-2) is already booked from October 27, 2026, 02:00 PM to October 27, 2026, 04:00 PM.'
    ])
})
