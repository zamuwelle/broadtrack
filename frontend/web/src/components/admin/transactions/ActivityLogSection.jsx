import { RotateCcw } from 'lucide-react'
import { ActivityCard } from '@/components/admin/transactions/ActivityCard'

const defaultBooking = Object.freeze({})
const defaultBadge = Object.freeze({ className: '', label: '' })

export const ActivityLogSection = ({
    equipmentId = '',
    timelineColor = '',
    booking = defaultBooking,
    borrowerName = '',
    borrowerDepartment = '',
    statusBadge = defaultBadge,
    startDateFormatted = '',
    endDateFormatted = '',
    variant = '',
    overdueDuration = ''
}) => (
    <div className="bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-y border-slate-200 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-wide">
                <RotateCcw size={16} className="text-slate-500" />
                <span>ACTIVITY &amp; TRANSACTION LOG (1)</span>
            </div>
            <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-300 text-slate-600 text-[11px] sm:text-xs font-medium">
                ID: {equipmentId}
            </span>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex flex-col items-center self-stretch shrink-0 pt-2">
                <div className={`size-3 sm:size-3.5 rounded-full ${timelineColor} shrink-0`} />
                <div className="w-[2px] bg-slate-200 flex-1 my-2" />
            </div>

            <ActivityCard
                booking={booking}
                borrowerName={borrowerName}
                borrowerDepartment={borrowerDepartment}
                statusBadge={statusBadge}
                startDateFormatted={startDateFormatted}
                endDateFormatted={endDateFormatted}
                variant={variant}
                overdueDuration={overdueDuration}
            />
        </div>
    </div>
)
