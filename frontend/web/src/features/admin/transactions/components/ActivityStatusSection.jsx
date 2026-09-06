import { Calendar } from 'lucide-react'
import { formatDate } from '@shared/util/date'

const defaultBooking = Object.freeze({})

const getReturnDate = (booking) => booking.return_date || booking.returned_at || booking.updated_at
const getRejectionReason = (booking) => booking.rejection_reason || 'The equipment is under maintenance.'

export const ActivityStatusSection = ({
    booking = defaultBooking,
    variant = '',
    endDateFormatted = '',
    overdueDuration = ''
}) => (
    <>
        {variant === 'completed' && (
            <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-4 flex flex-col gap-1.5">
                <span className="text-sky-800 text-[10px] font-semibold tracking-wider">ACTUAL RETURN DATE</span>
                <div className="text-blue-600 text-xs font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-600" />
                    <span>{formatDate(getReturnDate(booking))}</span>
                </div>
                {booking.returned_by_user?.full_name ? (
                    <div className="border-t border-slate-200/80 pt-1.5 text-[10px] text-slate-500 font-medium">
                        Processed by:{' '}
                        <span className="text-slate-800 font-semibold">{booking.returned_by_user.full_name}</span>
                    </div>
                ) : null}
            </div>
        )}

        {variant === 'overdue' && (
            <div className="bg-orange-50 rounded-xl border border-amber-400 p-4 flex flex-col gap-1">
                <span className="text-amber-600 text-[10px] font-semibold tracking-wider">RETURN OVERDUE</span>
                <div className="text-amber-700 text-xs font-medium">
                    <span className="font-semibold">Expected Return: </span>
                    <span>{endDateFormatted}</span>
                </div>
                <div className="text-amber-700 text-xs font-medium">
                    <span className="font-semibold">Overdue by: </span>
                    <span>{overdueDuration}</span>
                </div>
            </div>
        )}

        {variant === 'rejected' && (
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-3.5 text-xs text-rose-900">
                <span className="font-bold">Rejection Reason: </span>
                <span className="font-normal">{getRejectionReason(booking)}</span>
            </div>
        )}

        {booking.purpose && (
            <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Project/Purpose: </span>
                <span className="font-normal">{booking.purpose}</span>
            </div>
        )}

        {booking.approval_note && variant !== 'rejected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3.5 py-2 text-xs">
                <span className="text-green-700 font-semibold">Admin Notes: </span>
                <span className="text-green-700 font-normal">{booking.approval_note}</span>
            </div>
        )}
    </>
)
