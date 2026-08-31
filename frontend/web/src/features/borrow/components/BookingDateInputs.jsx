import { useCallback } from 'react'
import { formatDate } from '@shared/util/date'
import { Icon } from '@/components/ui/Icon'

export const BookingDateInputs = ({
    startDate = '',
    endDate = '',
    minStartDate = '',
    onStartDateChange,
    onEndDateChange
}) => {
    const handlePickerClick = useCallback((event) => {
        if (event.currentTarget && typeof event.currentTarget.showPicker === 'function') {
            try {
                event.currentTarget.showPicker()
            } catch {
                /* empty */
            }
        }
    }, [])

    return (
        <div className="flex flex-col lg:flex-row w-full items-center justify-start gap-3 lg:gap-4">
            <div className="w-full lg:flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch justify-start text-xs font-normal font-['Poppins'] text-black">
                    Start Date <span className="text-red-500">*</span>
                </div>
                <div className="relative flex h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 outline outline-1 outline-offset-[-1px] outline-slate-300">
                    <span
                        className={`text-xs font-normal font-['Poppins'] whitespace-nowrap select-none mr-2 truncate ${startDate ? 'text-black' : 'text-neutral-400'}`}>
                        {startDate ? formatDate(startDate) : 'Select start date & time'}
                    </span>
                    <Icon name="calendar" className="size-4 shrink-0 pointer-events-none" />
                    <input
                        type="datetime-local"
                        value={startDate}
                        min={minStartDate}
                        onClick={handlePickerClick}
                        onChange={onStartDateChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:light]"
                    />
                </div>
            </div>
            <div className="w-full lg:flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch justify-start text-xs font-normal font-['Poppins'] text-black">
                    End Date <span className="text-red-500">*</span>
                </div>
                <div className="relative flex h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 outline outline-1 outline-offset-[-1px] outline-slate-300">
                    <span
                        className={`text-xs font-normal font-['Poppins'] whitespace-nowrap select-none mr-2 truncate ${endDate ? formatDate(endDate) : 'Select end date & time'}`}>
                        {endDate ? formatDate(endDate) : 'Select end date & time'}
                    </span>
                    <Icon name="calendar" className="size-4 shrink-0 pointer-events-none" />
                    <input
                        type="datetime-local"
                        value={endDate}
                        min={startDate || minStartDate}
                        onClick={handlePickerClick}
                        onChange={onEndDateChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:light]"
                    />
                </div>
            </div>
        </div>
    )
}
