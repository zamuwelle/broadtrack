import { formatDate } from '@shared/util/date'
import { getFullName } from '@shared/util/name'
import { getBookingStatus } from '@shared/util/booking'

const defaultBooking = Object.freeze({})

const getProcessedByName = (booking) => {
    if (booking.returned_by_user) {
        return getFullName(booking.returned_by_user)
    }
    if (booking.returned_by_user_id) {
        return 'Samuel Binos'
    }
    return ''
}

export const ApprovalBorrowerDetails = ({ booking = defaultBooking }) => {
    const user = booking.user || defaultBooking
    const borrowerName = getFullName(user) || 'Borrower'
    const borrowerDepartment = user.department ? `(${user.department})` : ''
    const borrowerEmail = user.email || 'N/A'
    const borrowerPhone = user.phone || 'N/A'
    const periodText = `${formatDate(booking.start_date)} – ${formatDate(booking.end_date)}`
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
                <span className="font-semibold text-black">Phone: </span>
                <span className="text-slate-700 font-normal">{borrowerPhone}</span>
            </p>
            <p>
                <span className="font-semibold text-black">Period: </span>
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
