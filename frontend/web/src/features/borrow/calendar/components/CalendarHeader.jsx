import { Icon } from '@/components/ui/Icon'

const noop = () => null

export const CalendarHeader = ({ monthYearHeader = '', onPreviousMonth = noop, onNextMonth = noop }) => (
    <div className="h-10 rounded-lg flex items-center justify-between lg:justify-start gap-3 lg:gap-4 w-full lg:w-auto">
        <span className="text-xl lg:text-2xl font-semibold text-slate-900 font-['Poppins'] whitespace-nowrap">
            {monthYearHeader}
        </span>
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={onPreviousMonth}
                aria-label="Previous month"
                className="h-10 px-3.5 lg:px-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex justify-center items-center transition cursor-pointer">
                <Icon name="chevron3" className="w-3.5 h-3.5 rotate-180" />
            </button>
            <button
                type="button"
                onClick={onNextMonth}
                aria-label="Next month"
                className="h-10 px-3.5 lg:px-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex justify-center items-center transition cursor-pointer">
                <Icon name="chevron3" className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
)
