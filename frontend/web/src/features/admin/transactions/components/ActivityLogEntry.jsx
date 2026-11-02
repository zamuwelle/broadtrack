import { cn } from 'cn'
import { DateBlock } from '@/features/admin/transactions/components/DateBlock'
import { ActivityStatusSection } from '@/features/admin/transactions/components/ActivityStatusSection'
import { Mail } from 'lucide-react'

export const ActivityLogEntry = ({
    booking,
    timelineColor,
    borrowerName,
    borrowerDepartment,
    statusBadge,
    startDateFormatted,
    endDateFormatted,
    variant,
    overdueDuration,
    selected,
    onReminder,
    onReturn
}) => (
    <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex flex-col items-center self-stretch shrink-0 pt-2">
            <div className={cn('size-3 sm:size-3.5 rounded-full shrink-0', timelineColor)} />
            <div className="w-[2px] bg-slate-200 flex-1 my-2" />
        </div>

        <div className="flex-1 min-w-0 bg-slate-50 rounded-2xl border border-slate-300 p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
            <div className="flex flex-wrap max-[374px]:flex-col items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex flex-col gap-0.5 [overflow-wrap:anywhere]">
                    <span className="text-slate-500 text-xs font-medium">{booking.ticket_id}</span>
                    <span className="text-slate-900 text-base font-semibold">{borrowerName}</span>
                    <span className="text-slate-600 text-xs font-medium">{borrowerDepartment}</span>
                </div>

                <span
                    className={cn(
                        'px-4 py-1 text-xs font-semibold rounded-xl inline-flex items-center justify-center',
                        statusBadge.className
                    )}>
                    {statusBadge.label}
                </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DateBlock label="START DATE & TIME" dateText={startDateFormatted} />
                <DateBlock label="END DATE & TIME" dateText={endDateFormatted} />
            </div>

            <ActivityStatusSection
                booking={booking}
                variant={variant}
                endDateFormatted={endDateFormatted}
                overdueDuration={overdueDuration}
            />
            {selected && variant === 'overdue' ? (
                <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-4">
                    <button
                        type="button"
                        onClick={onReminder}
                        className="w-full sm:w-auto h-12 px-6 bg-sky-800 hover:bg-sky-900 transition-colors rounded-lg text-white text-base font-medium inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <Mail size={18} /> Send Reminder
                    </button>
                    <div className="text-xs sm:text-sm font-medium text-slate-700 flex flex-wrap justify-center items-center gap-1.5">
                        <span>Has the equipment been returned?</span>
                        <button
                            type="button"
                            onClick={onReturn}
                            className="text-blue-600 hover:underline font-semibold cursor-pointer">
                            Confirm here
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    </div>
)
