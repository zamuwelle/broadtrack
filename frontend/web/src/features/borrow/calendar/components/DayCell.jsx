import { useCallback, useMemo } from 'react'
import { cn } from 'cn'
import { resolveBookingScheduleStatus } from '@shared/util/booking'

const defaultBookings = Object.freeze([])
const noop = () => null
const maxDots = 4

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
    const matchingBookings = useMemo(
        () => filteredBookings.filter((booking) => booking.startDate <= dateKey && dateKey <= booking.endDate),
        [filteredBookings, dateKey]
    )

    const hasActiveBooking = matchingBookings.some((booking) => resolveBookingScheduleStatus(booking) === 'active')
    const hasPendingBooking = matchingBookings.some((booking) => resolveBookingScheduleStatus(booking) === 'pending')

    const displayBookings = matchingBookings.slice(0, maxDots)
    const extraDotsCount = matchingBookings.length - maxDots

    const handleClick = useCallback(() => {
        onSelectDate(dateKey)
    }, [dateKey, onSelectDate])

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'aspect-square lg:aspect-auto h-full min-h-0 lg:min-h-[56px] rounded-lg outline outline-1 outline-offset-[-1px] flex flex-col items-center justify-between pt-1 pb-1 lg:pt-2 lg:pb-2 px-0.5 lg:px-1 transition cursor-pointer',
                getCellClasses(isSelected, hasActiveBooking, hasPendingBooking)
            )}>
            <div
                className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium pointer-events-none',
                    {
                        'bg-calendar-blue text-primary-dark font-semibold': isSelected,
                        'text-slate-800': !isSelected
                    }
                )}>
                {day}
            </div>
            <div className="flex items-center justify-center gap-1 flex-wrap max-w-full px-0.5 pointer-events-none min-h-[8px]">
                {displayBookings.map((booking) => {
                    const scheduleStatus = resolveBookingScheduleStatus(booking)

                    return (
                        <div
                            key={`dot-${booking.id ?? booking.ticket_id}`}
                            className={cn('w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full shrink-0', {
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
        </button>
    )
}
