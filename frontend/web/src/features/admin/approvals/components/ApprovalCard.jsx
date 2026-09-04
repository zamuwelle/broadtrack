import { getBookingStatus } from '@shared/util/booking'
import { ApprovalHeader } from '@/features/admin/approvals/components/ApprovalHeader'
import { ApprovalBorrowerDetails } from '@/features/admin/approvals/components/ApprovalBorrowerDetails'
import { ApprovalNotesDetails } from '@/features/admin/approvals/components/ApprovalNotesDetails'
import { ApprovalPendingActions } from '@/features/admin/approvals/components/ApprovalPendingActions'
import { ApprovalConfirmedAction } from '@/features/admin/approvals/components/ApprovalConfirmedAction'

const defaultBooking = Object.freeze({})
const noop = () => null

const getAccentColor = (status) => {
    if (status === 'approved' || status === 'released') {
        return 'bg-green-500'
    }
    if (status === 'rejected') {
        return 'bg-rose-900'
    }
    if (status === 'returned') {
        return 'bg-sky-800'
    }
    return 'bg-amber-500'
}

export const ApprovalCard = ({ booking = defaultBooking, onApprove = noop, onReject = noop, onReturn = noop }) => {
    if (!booking.id) {
        return null
    }

    const status = getBookingStatus(booking)
    const isPending = status === 'pending'
    const isConfirmed = status === 'approved' || status === 'released'
    const isRejected = status === 'rejected'
    const isCompleted = status === 'returned'

    const equipments = booking.equipments || []
    const equipment = equipments[0] || defaultBooking
    const equipmentModel = equipment.model || null

    const accentColor = getAccentColor(status)
    const cardBorder = isRejected || isCompleted ? 'border-slate-300' : 'border-slate-200'

    return (
        <div
            className={`w-full relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.18)] rounded-xl overflow-hidden bg-white border ${cardBorder} flex font-['Poppins']`}>
            <div className={`w-[9px] shrink-0 ${accentColor}`} />

            <div className="flex-1 p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start min-w-0">
                <div className="w-full h-44 sm:size-44 lg:size-48 shrink-0 rounded-lg bg-slate-200 border border-slate-300 self-center sm:self-start" />

                <div className="flex-1 flex flex-col justify-between min-w-0 w-full">
                    <ApprovalHeader booking={booking} />

                    {equipmentModel ? (
                        <p className="text-xs text-slate-500 font-normal mt-0.5">{equipmentModel}</p>
                    ) : null}
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Ticket ID: {booking.ticket_id}</p>

                    <div className="w-full h-0 border-t border-slate-200 my-3" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-xs">
                        <ApprovalBorrowerDetails booking={booking} />
                        <ApprovalNotesDetails booking={booking} />
                    </div>

                    {isPending ? (
                        <ApprovalPendingActions booking={booking} onApprove={onApprove} onReject={onReject} />
                    ) : null}

                    {isConfirmed ? <ApprovalConfirmedAction booking={booking} onReturn={onReturn} /> : null}
                </div>
            </div>
        </div>
    )
}
