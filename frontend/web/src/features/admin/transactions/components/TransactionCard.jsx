import { useCallback } from 'react'
import { cn } from 'cn'
import { getBookingStatus, getBookingStatusBadge } from '@shared/util/booking'
import { formatSimpleDate } from '@shared/util/date'

const styles = {
    overdue: 'bg-orange-50 text-amber-600',
    completed: 'bg-blue-200 text-sky-800',
    rejected: 'bg-rose-50 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-600',
    confirmed: 'bg-green-100 text-green-600'
}

export const TransactionCard = ({ booking, onViewDetails }) => {
    const handleViewDetails = useCallback(() => onViewDetails(booking), [booking, onViewDetails])
    const equipment = booking.equipments?.[0] || {}
    const badge = getBookingStatusBadge(booking)
    const returned =
        getBookingStatus(booking) === 'returned'
            ? booking.return_date || booking.returned_at || booking.updated_at
            : null
    return (
        <article className="rounded-lg border border-slate-300 bg-white p-4 text-xs text-slate-700 shadow-xs">
            <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{booking.ticket_id}</span>
                <span className={cn('rounded-lg px-2.5 py-1 font-semibold', styles[badge.variant] || styles.confirmed)}>
                    {badge.label}
                </span>
            </div>
            <dl className="mt-3 text-sm [&>div]:grid [&>div]:grid-cols-[100px_minmax(0,1fr)] [&>div]:gap-2 [&>div]:px-2 [&>div]:py-2 [&>div:nth-child(odd)]:bg-slate-50 [&_dt]:text-slate-600 [&_dd]:break-words">
                <div>
                    <dt>Borrower</dt>
                    <dd>
                        {booking.user?.full_name || 'Borrower'}
                        {booking.user?.department ? ` · ${booking.user.department}` : ''}
                    </dd>
                </div>
                <div>
                    <dt>Equipment</dt>
                    <dd>
                        {equipment.name || 'Equipment'}
                        {equipment.model ? ` · ${equipment.model}` : ''}
                    </dd>
                </div>
                <div>
                    <dt>Borrow Date</dt>
                    <dd>{booking.date_range_label ?? '---'}</dd>
                </div>
                <div>
                    <dt>Return Date</dt>
                    <dd>{formatSimpleDate(returned)}</dd>
                </div>
            </dl>
            <button
                type="button"
                onClick={handleViewDetails}
                className="mt-3 w-full rounded-md bg-blue-50 px-3 py-2 text-blue-600 font-medium cursor-pointer">
                View Details →
            </button>
        </article>
    )
}
