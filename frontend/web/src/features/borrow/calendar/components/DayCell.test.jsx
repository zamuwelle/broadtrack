import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { DayCell } from '@/features/borrow/calendar/components/DayCell'

it('shows more booking dots and counts the remaining bookings', () => {
    const bookings = Array.from({ length: 11 }, (_, id) => ({
        id,
        status: 'pending',
        startDate: '2026-10-30',
        endDate: '2026-10-30'
    }))
    render(<DayCell day={30} dateKey="2026-10-30" filteredBookings={bookings} onSelectDate={vi.fn()} />)
    expect(screen.getByRole('button', { name: '30 +7' })).toBeInTheDocument()
})

it('uses the available width to show all dots on a wide day', () => {
    vi.stubGlobal(
        'ResizeObserver',
        vi.fn(function mockResizeObserver(onResize) {
            this.observe = () => onResize([{ contentRect: { width: 120 } }])
            this.disconnect = vi.fn()
        })
    )
    const bookings = Array.from({ length: 11 }, (_, id) => ({
        id,
        status: 'pending',
        startDate: '2026-10-30',
        endDate: '2026-10-30'
    }))
    render(<DayCell day={30} dateKey="2026-10-30" filteredBookings={bookings} />)
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument()
})

it('uses additional rows when the day has enough height', () => {
    vi.stubGlobal(
        'ResizeObserver',
        vi.fn(function mockResizeObserver(onResize) {
            this.observe = () => onResize([{ contentRect: { width: 32, height: 100 } }])
            this.disconnect = vi.fn()
        })
    )
    const bookings = Array.from({ length: 20 }, (_, id) => ({
        id,
        status: 'pending',
        startDate: '2026-10-30',
        endDate: '2026-10-30'
    }))
    render(<DayCell day={30} dateKey="2026-10-30" filteredBookings={bookings} />)
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument()
})

afterEach(() => vi.unstubAllGlobals())
