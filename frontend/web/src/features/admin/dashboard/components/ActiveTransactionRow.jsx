const defaultTransactions = Object.freeze([])
const defaultBooking = Object.freeze({})

const getBorrowerInfo = (booking = defaultBooking) => {
    const user = booking.user || defaultBooking
    const department = user.department ? ` (${user.department})` : ''
    return `Borrower: ${user.full_name || 'Unknown'}${department}`
}

const statusBadgeMap = Object.freeze({
    pending: {
        label: 'Pending Approval',
        className: 'bg-orange-50 rounded-[10px] border border-orange-200 text-amber-500'
    },
    approved: {
        label: 'Approved',
        className: 'bg-green-50 rounded-[10px] border border-green-200 text-green-600'
    }
})

const getStatusBadge = (booking = defaultBooking) => {
    if (booking.is_overdue) {
        return {
            label: 'Overdue Reminder',
            className: 'bg-orange-50 rounded-[10px] border border-orange-200 text-amber-500'
        }
    }
    if (booking.status && statusBadgeMap[booking.status]) {
        return statusBadgeMap[booking.status]
    }
    const fallbackLabel = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'
    return {
        label: fallbackLabel,
        className: 'bg-gray-50 rounded-[10px] border border-gray-200 text-gray-600'
    }
}

export const ActiveTransactionRow = ({ booking = defaultBooking }) => {
    const equipments = booking.equipments || defaultTransactions
    const equipmentTitle = equipments[0]?.name || 'Equipment'
    const borrowerInfo = getBorrowerInfo(booking)
    const statusBadge = getStatusBadge(booking)
    const timelineRange = booking.date_range_label ?? '---'

    return (
        <div className="rounded-md border border-gray-200 p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
            <div className="flex items-start justify-between gap-3 md:hidden">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{equipmentTitle}</div>
                    <div className="text-xs font-normal text-gray-600 mt-0.5 truncate">{borrowerInfo}</div>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold shrink-0 ${statusBadge.className}`}>
                    {statusBadge.label}
                </span>
            </div>

            <div className="hidden md:block flex-1 min-w-0 md:min-w-[200px]">
                <div className="text-base font-semibold text-gray-900">{equipmentTitle}</div>
                <div className="text-xs font-normal text-gray-600 mt-1">{borrowerInfo}</div>
            </div>

            <div className="flex items-center justify-between md:block flex-1 min-w-0 md:min-w-[240px] pt-2 md:pt-0 border-t border-gray-100 md:border-t-0">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 md:text-gray-900 tracking-wider">
                    TIMELINE
                </span>
                <div className="text-xs font-medium text-gray-700 md:mt-1">{timelineRange}</div>
            </div>

            <div className="hidden md:flex shrink-0 self-center">
                <div
                    className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center justify-center ${statusBadge.className}`}>
                    {statusBadge.label}
                </div>
            </div>
        </div>
    )
}
