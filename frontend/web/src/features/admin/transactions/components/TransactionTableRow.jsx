import { useCallback } from 'react'
import { getBookingStatus, getBookingStatusBadge } from '@shared/util/booking'
import { formatSimpleDate } from '@shared/util/date'

const defaultBooking = Object.freeze({})
const noop = () => null

const statusBadgeStyles = Object.freeze({
    overdue: 'bg-orange-50 text-amber-500 border border-amber-300',
    completed: 'bg-blue-200 text-sky-800',
    rejected: 'bg-rose-50 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-600',
    confirmed: 'bg-green-100 text-green-600'
})

const formatReturnDate = (booking = defaultBooking) => {
    const status = getBookingStatus(booking)
    const dateValue = status === 'returned' ? booking.return_date || booking.returned_at || booking.updated_at : null
    return formatSimpleDate(dateValue)
}

export const TransactionTableRow = ({ booking = defaultBooking, onViewDetails = noop }) => {
    const handleViewDetails = useCallback(() => {
        onViewDetails(booking)
    }, [booking, onViewDetails])

    const equipment = booking.equipments?.[0] || {}
    const equipmentName = equipment.name || 'Equipment'
    const equipmentModel = equipment.model || ''
    const borrowerName = booking.user?.full_name || 'Borrower'
    const borrowerDepartment = booking.user?.department || ''
    const statusBadge = getBookingStatusBadge(booking)
    const returnDateText = formatReturnDate(booking)
    const badgeClass = statusBadgeStyles[statusBadge.variant] ?? statusBadgeStyles.confirmed

    return (
        <tr className="hover:bg-slate-50/70 transition-colors">
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                {booking.ticket_id}
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap">
                <div className="text-xs font-medium text-slate-900">{borrowerName}</div>
                {borrowerDepartment ? (
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">{borrowerDepartment}</div>
                ) : null}
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap">
                <div className="text-xs font-medium text-slate-900">{equipmentName}</div>
                {equipmentModel ? (
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">{equipmentModel}</div>
                ) : null}
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                {booking.date_range_label ?? '---'}
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                {returnDateText}
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap">
                <span
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg inline-flex items-center justify-center ${badgeClass}`}>
                    {statusBadge.label}
                </span>
            </td>
            <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-right whitespace-nowrap">
                <button
                    type="button"
                    onClick={handleViewDetails}
                    className="text-blue-600 hover:underline text-xs font-medium cursor-pointer">
                    View Details →
                </button>
            </td>
        </tr>
    )
}
