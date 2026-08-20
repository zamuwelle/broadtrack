import { useMemo } from 'react'
import { DayCell } from '@/components/borrow/calendar/DayCell'

const weekDays = Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
const defaultBookings = Object.freeze([])
const noop = () => null

const leadingKeys = Object.freeze(Array.from({ length: 14 }, (_, i) => `lead-day-key-${i}`))
const trailingKeys = Object.freeze(Array.from({ length: 14 }, (_, i) => `trail-day-key-${i}`))

export const CalendarGrid = ({
    year,
    monthIndex,
    totalDaysInMonth,
    leadingEmptyDays = 0,
    trailingEmptyDays = 0,
    selectedDate,
    filteredBookings = defaultBookings,
    onSelectDate = noop,
    weeksCount = 5
}) => {
    const gridRowsStyle = useMemo(() => ({ gridTemplateRows: `repeat(${weeksCount}, minmax(0, 1fr))` }), [weeksCount])

    return (
        <div className="flex flex-col gap-2 lg:flex-1 lg:min-h-0">
            <div className="grid grid-cols-7 text-center shrink-0">
                {weekDays.map((dayLabel) => (
                    <div key={dayLabel} className="text-xs lg:text-sm font-medium text-slate-800 py-0.5">
                        {dayLabel}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-2 lg:flex-1 lg:min-h-0" style={gridRowsStyle}>
                {leadingKeys.slice(0, leadingEmptyDays).map((key) => (
                    <div
                        key={key}
                        className="aspect-square lg:aspect-auto h-full min-h-0 lg:min-h-[56px] bg-gray-100 rounded-lg border border-slate-300 pointer-events-none"
                    />
                ))}

                {Array.from({ length: totalDaysInMonth }).map((_, index) => {
                    const day = index + 1
                    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isSelected = selectedDate === dateKey

                    return (
                        <DayCell
                            key={dateKey}
                            day={day}
                            dateKey={dateKey}
                            isSelected={isSelected}
                            filteredBookings={filteredBookings}
                            onSelectDate={onSelectDate}
                        />
                    )
                })}

                {trailingKeys.slice(0, trailingEmptyDays).map((key) => (
                    <div
                        key={key}
                        className="aspect-square lg:aspect-auto h-full min-h-0 lg:min-h-[56px] bg-gray-100 rounded-lg border border-slate-300 pointer-events-none"
                    />
                ))}
            </div>
        </div>
    )
}
