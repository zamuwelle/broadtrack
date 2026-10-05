import { useEffect, useRef } from 'react'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { cn } from 'cn'
import { formatDate } from '@shared/util/date'
import { Icon } from '@/components/ui/Icon'

const defaultList = Object.freeze([])

const useFlatpickr = ({ inputRef, value, minDate, excludeDateIntervals, onChange }) => {
    const pickerRef = useRef(null)
    const minDateRef = useRef(minDate)

    useEffect(() => {
        minDateRef.current = minDate
    }, [minDate])

    useEffect(() => {
        if (!inputRef.current) {
            return
        }

        const isFullyBookedDay = (date) => {
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(date)
            dayEnd.setHours(24, 0, 0, 0)
            return (excludeDateIntervals || []).some((interval) => interval.start <= dayStart && interval.end >= dayEnd)
        }

        const options = {
            enableTime: true,
            minuteIncrement: 1,
            dateFormat: 'Y-m-d\\TH:i',
            disable: [isFullyBookedDay],
            onChange: (_selectedDates, dateStr) => {
                if (dateStr) {
                    onChange(dateStr)
                }
            }
        }

        if (minDateRef.current) {
            options.minDate = minDateRef.current
        }

        pickerRef.current = flatpickr(inputRef.current, options)

        return () => {
            pickerRef.current?.destroy()
        }
    }, [inputRef, excludeDateIntervals, onChange])

    useEffect(() => {
        if (pickerRef.current && minDate) {
            pickerRef.current.set('minDate', minDate)
        }
    }, [minDate])

    useEffect(() => {
        if (pickerRef.current && value) {
            pickerRef.current.setDate(value, false)
        }
    }, [value])

    return pickerRef
}

const DEFAULT_PROPS = Object.freeze({
    startDate: '',
    endDate: '',
    minStartDate: '',
    excludeDateIntervals: defaultList,
    hasStartConflict: false,
    hasEndConflict: false,
    hasScheduleConflict: false
})

export const BookingDateInputs = (props) => {
    const {
        startDate,
        endDate,
        minStartDate,
        excludeDateIntervals,
        hasStartConflict,
        hasEndConflict,
        hasScheduleConflict,
        onStartDateChange,
        onEndDateChange
    } = { ...DEFAULT_PROPS, ...props }

    const isStartInvalid = Boolean(hasStartConflict || (hasScheduleConflict && !hasEndConflict))
    const isEndInvalid = Boolean(hasEndConflict || (hasScheduleConflict && !hasStartConflict))
    const startInputRef = useRef(null)
    const endInputRef = useRef(null)

    useFlatpickr({
        inputRef: startInputRef,
        value: startDate,
        minDate: minStartDate,
        excludeDateIntervals,
        onChange: onStartDateChange
    })

    useFlatpickr({
        inputRef: endInputRef,
        value: endDate,
        minDate: startDate || minStartDate,
        excludeDateIntervals,
        onChange: onEndDateChange
    })

    const startLabel = startDate ? formatDate(startDate) : 'Select start date & time'
    const endLabel = endDate ? formatDate(endDate) : 'Select end date & time'

    return (
        <div className="flex flex-col lg:flex-row w-full items-start justify-start gap-8 lg:gap-4">
            <div className="w-full lg:flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch justify-start text-xs font-normal font-['Poppins'] text-black">
                    Start Date <span className="text-red-500">*</span>
                </div>
                <div
                    className={cn(
                        'relative flex h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 outline outline-1 outline-offset-[-1px] cursor-pointer outline-slate-300',
                        isStartInvalid && 'outline-red-500'
                    )}>
                    <span
                        className={cn(
                            "text-xs font-normal font-['Poppins'] whitespace-nowrap select-none mr-2 truncate text-neutral-400",
                            startDate && 'text-black'
                        )}>
                        {startLabel}
                    </span>
                    <Icon name="calendar" className="size-4 shrink-0 pointer-events-none" />
                    <input
                        ref={startInputRef}
                        type="text"
                        readOnly
                        aria-label="Start Date"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                </div>
            </div>
            <div className="w-full lg:flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch justify-start text-xs font-normal font-['Poppins'] text-black">
                    End Date <span className="text-red-500">*</span>
                </div>
                <div
                    className={cn(
                        'relative flex h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 outline outline-1 outline-offset-[-1px] cursor-pointer outline-slate-300',
                        isEndInvalid && 'outline-red-500'
                    )}>
                    <span
                        className={cn(
                            "text-xs font-normal font-['Poppins'] whitespace-nowrap select-none mr-2 truncate text-neutral-400",
                            endDate && 'text-black'
                        )}>
                        {endLabel}
                    </span>
                    <Icon name="calendar" className="size-4 shrink-0 pointer-events-none" />
                    <input
                        ref={endInputRef}
                        type="text"
                        readOnly
                        aria-label="End Date"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                </div>
            </div>
        </div>
    )
}
