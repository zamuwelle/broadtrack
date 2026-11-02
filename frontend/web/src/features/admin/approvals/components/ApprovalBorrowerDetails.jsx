import { formatDate } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'

const defaultBooking = Object.freeze({})

const getProcessedByName = (booking) => booking.returned_by_user?.full_name || ''

export const ApprovalBorrowerDetails = ({ booking = defaultBooking }) => {
    const user = booking.user || defaultBooking
    const borrowerName = user.full_name || 'Borrower'
    const borrowerDepartment = user.department ? `(${user.department})` : ''
    const borrowerEmail = user.email || 'N/A'
    const periodText = booking.date_time_range_label ?? ' – '
    const status = getBookingStatus(booking)
    const isCompleted = status === 'returned'
    const processedByName = getProcessedByName(booking)

    return (
        <div className="flex flex-col gap-1.5 lg:pr-6 lg:border-r lg:border-slate-200">
            <p>
                <span className="font-semibold text-black">Borrower: </span>
                <span className="text-slate-700 font-normal">
                    {borrowerName} {borrowerDepartment}
                </span>
            </p>
            <p>
                <span className="font-semibold text-black">Email: </span>
                <span className="text-slate-700 font-normal">{borrowerEmail}</span>
            </p>
            <p>
                <span className="font-semibold text-black max-[374px]:block">Period: </span>
                <span className="text-slate-700 font-normal">{periodText}</span>
            </p>

            {isCompleted ? (
                <div className="mt-2 flex flex-col gap-1">
                    <div className="w-fit bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-sky-800 self-start">
                        Returned On: {formatDate(booking.return_date || booking.updated_at)}
                    </div>
                    {processedByName ? (
                        <div className="text-xs text-slate-500 mt-0.5">
                            <span className="text-slate-400 font-normal">Processed by: </span>
                            <span className="font-medium text-slate-800">{processedByName}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
