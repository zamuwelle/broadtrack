import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'cn'
import { resolveBookingScheduleStatus } from '@shared/util/booking'

const defaultBookings = Object.freeze([])
const noop = () => null

const getCellClasses = (isSelected, hasActiveBooking, hasPendingBooking) => {
    if (isSelected) {
        if (hasActiveBooking) {
            return 'bg-green-500/20 outline-green-500'
        }
        if (hasPendingBooking) {
            return 'bg-calendar-amber/50 outline-amber-500'
        }
        return 'bg-slate-300 outline-slate-300'
    }
    if (hasActiveBooking) {
        return 'bg-slate-50 outline-green-500'
    }
    if (hasPendingBooking) {
        return 'bg-slate-50 outline-amber-500'
    }
    return 'bg-slate-50 outline-slate-300 hover:bg-slate-100'
}

export const DayCell = ({ day, dateKey, isSelected, filteredBookings = defaultBookings, onSelectDate = noop }) => {
    const cellRef = useRef(null)
    const [size, setSize] = useState({ width: 32, height: 44, dateHeight: 20 })
    const matchingBookings = useMemo(
        () => filteredBookings.filter((booking) => booking.startDate <= dateKey && dateKey <= booking.endDate),
        [filteredBookings, dateKey]
    )

    const hasActiveBooking = matchingBookings.some((booking) => resolveBookingScheduleStatus(booking) === 'active')
    const hasPendingBooking = matchingBookings.some((booking) => resolveBookingScheduleStatus(booking) === 'pending')

    useEffect(() => {
        if (matchingBookings.length === 0 || typeof ResizeObserver === 'undefined') {
            return
        }
        const cell = cellRef.current
        if (!cell) {
            return
        }
        const observer = new ResizeObserver(([entry]) => {
            if (!entry || !cell.isConnected) {
                return
            }
            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height || 44,
                dateHeight: cell.firstElementChild?.getBoundingClientRect().height || 20
            })
        })
        observer.observe(cell)
        return () => observer.disconnect()
    }, [matchingBookings.length])

    const { height, dateHeight } = size
    const width = size.width * 0.8
    const columns = Math.max(1, Math.floor((width + 4) / 10))
    const rows = Math.max(1, Math.floor((height - dateHeight + 1) / 10))
    const countWidth = String(matchingBookings.length).length * 6 + 6
    const overflowDots = columns * (rows - 1) + Math.max(0, Math.floor((width - countWidth) / 10))
    const visibleDots = matchingBookings.length > columns * rows ? overflowDots : columns * rows
    const displayBookings = matchingBookings.slice(0, visibleDots)
    const extraDotsCount = matchingBookings.length - visibleDots

    const handleClick = useCallback(() => {
        onSelectDate(dateKey)
    }, [dateKey, onSelectDate])

    return (
        <button
            ref={cellRef}
            type="button"
            onClick={handleClick}
            className={cn(
                'relative w-full h-full min-h-0 lg:min-h-[56px] rounded-lg outline outline-1 outline-offset-[-1px] flex flex-col items-center justify-between pt-1 pb-1 lg:pt-2 lg:pb-2 px-0.5 lg:px-1 transition cursor-pointer',
                getCellClasses(isSelected, hasActiveBooking, hasPendingBooking)
            )}>
            <div
                className={cn(
                    'w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium pointer-events-none',
                    {
                        'bg-calendar-blue text-primary-dark font-semibold': isSelected,
                        'text-slate-800': !isSelected
                    }
                )}>
                {day}
            </div>
            <div className="flex flex-1 items-center justify-center w-full min-h-0 contain-size pointer-events-none">
                <div className="flex flex-wrap items-center justify-center gap-1 w-[80%]">
                    {displayBookings.map((booking) => {
                        const scheduleStatus = resolveBookingScheduleStatus(booking)

                        return (
                            <div
                                key={`dot-${booking.id ?? booking.ticket_id}`}
                                className={cn('w-1.5 h-1.5 rounded-full shrink-0', {
                                    'bg-green-500': scheduleStatus === 'active',
                                    'bg-amber-500': scheduleStatus !== 'active'
                                })}
                            />
                        )
                    })}
                    {extraDotsCount > 0 ? (
                        <span className="text-[9px] font-bold text-slate-500 leading-none">+{extraDotsCount}</span>
                    ) : null}
                </div>
            </div>
        </button>
    )
}
