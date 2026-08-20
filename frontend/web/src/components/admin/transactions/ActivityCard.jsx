import { DateBlock } from '@/components/admin/transactions/DateBlock'
import { ActivityStatusSection } from '@/components/admin/transactions/ActivityStatusSection'

const defaultBooking = Object.freeze({})
const defaultBadge = Object.freeze({ className: '', label: '' })

export const ActivityCard = ({
    booking = defaultBooking,
    borrowerName = '',
    borrowerDepartment = '',
    statusBadge = defaultBadge,
    startDateFormatted = '',
    endDateFormatted = '',
    variant = '',
    overdueDuration = ''
}) => (
    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-300 p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
        <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-xs font-medium">{booking.ticket_id}</span>
                <span className="text-slate-900 text-base font-semibold">{borrowerName}</span>
                <span className="text-slate-600 text-xs font-medium">{borrowerDepartment}</span>
            </div>

            <span
                className={`px-4 py-1 text-xs font-semibold rounded-xl inline-flex items-center justify-center ${statusBadge.className}`}>
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
    </div>
)
