import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { CalendarPage } from '@/features/borrow/calendar/CalendarPage'

vi.mock('@/features/equipment/api/get-equipment', () => ({
    useEquipment: () => ({ data: [{ id: 1, brand: 'Canon', name: 'Camera' }] })
}))
vi.mock('@/features/bookings/api/get-bookings', () => ({
    useBookings: () => ({
        data: [
            {
                id: 1,
                status: 'approved',
                start_date: '2026-10-15T00:00:00Z',
                end_date: '2026-10-16T00:00:00Z',
                equipments: [{ id: 1, brand: 'Canon', name: 'Camera' }]
            }
        ]
    })
}))

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-15T12:00:00Z'))
})

afterEach(() => vi.useRealTimers())

it('filters a booking using its equipment label', () => {
    render(<CalendarPage />)
    fireEvent.click(screen.getByRole('button', { name: 'All Equipment Bookings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Canon Camera' }))
    fireEvent.click(screen.getByRole('button', { name: '15' }))
    expect(screen.getAllByText('Canon Camera')).toHaveLength(2)
})
