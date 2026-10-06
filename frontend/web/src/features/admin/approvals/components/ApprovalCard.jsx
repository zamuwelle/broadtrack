import { useCallback } from 'react'
import { cn } from 'cn'
import { getBookingStatus } from '@shared/util/booking'
import { getOptimizedImageUrl } from '@shared/util/image'
import { ApprovalHeader } from '@/features/admin/approvals/components/ApprovalHeader'
import { ApprovalStatusLine } from '@/features/admin/approvals/components/ApprovalStatusLine'
import { ApprovalBorrowerDetails } from '@/features/admin/approvals/components/ApprovalBorrowerDetails'
import { ApprovalNotesDetails } from '@/features/admin/approvals/components/ApprovalNotesDetails'

const defaultBooking = Object.freeze({})
const noop = () => null

const getAccentColor = (status) => {
    if (status === 'approved') {
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
    const handleApprove = useCallback(() => onApprove(booking), [booking, onApprove])
    const handleReject = useCallback(() => onReject(booking), [booking, onReject])
    const handleReturn = useCallback(() => onReturn(booking), [booking, onReturn])

    if (!booking.id) {
        return null
    }

    const status = getBookingStatus(booking)
    const isPending = status === 'pending'
    const isConfirmed = status === 'approved'

    const equipments = booking.equipments || []
    const equipment = equipments[0] || defaultBooking
    const equipmentModel = equipment.model || ''

    const accentColor = getAccentColor(status)

    return (
        <div
            className={cn(
                "w-full relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.18)] rounded-xl overflow-hidden bg-white border flex font-['Poppins']",
                {
                    'border-slate-300': status === 'rejected' || status === 'returned',
                    'border-slate-200': status !== 'rejected' && status !== 'returned'
                }
            )}>
            <div className={cn('w-[9px] shrink-0', accentColor)} />

            <div className="flex-1 p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start min-w-0">
                <div
                    className={cn(
                        'hidden sm:flex size-44 lg:size-48 shrink-0 rounded-lg bg-slate-100 has-[img]:bg-white self-center sm:self-start overflow-hidden items-center justify-center'
                    )}>
                    {equipment.image ? (
                        <img
                            src={getOptimizedImageUrl(equipment.image, 300)}
                            alt={equipment.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                        />
                    ) : null}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0 w-full">
                    <div className="flex items-start gap-3 sm:hidden">
                        <div
                            className={cn(
                                'size-20 min-[375px]:size-28 shrink-0 rounded-lg bg-slate-100 has-[img]:bg-white overflow-hidden flex items-center justify-center'
                            )}>
                            {equipment.image ? (
                                <img
                                    src={getOptimizedImageUrl(equipment.image, 300, 0)}
                                    alt={equipment.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <ApprovalHeader booking={booking} showStatus={false} />
                            <p className="text-xs text-slate-500 font-normal mt-1 empty:hidden">{equipmentModel}</p>
                            <p className="text-[11px] min-[375px]:text-xs text-slate-500 font-normal mt-0.5 whitespace-nowrap">
                                Ticket ID: {booking.ticket_id}
                            </p>
                        </div>
                    </div>
                    <ApprovalStatusLine booking={booking} mobile className="mt-3 sm:hidden" />

                    <div className="hidden sm:block">
                        <ApprovalHeader booking={booking} />
                        <p className="text-xs text-slate-500 font-normal mt-0.5 empty:hidden">{equipmentModel}</p>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">Ticket ID: {booking.ticket_id}</p>
                    </div>

                    <div className="w-full h-0 border-t border-slate-200 my-3" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-xs">
                        <ApprovalBorrowerDetails booking={booking} />
                        <ApprovalNotesDetails booking={booking} />
                    </div>

                    {isPending ? (
                        <div className="w-full mt-4 flex flex-row items-center gap-3">
                            <button
                                type="button"
                                onClick={handleApprove}
                                className="flex-1 h-10 px-3 bg-amber-500 hover:bg-amber-600 transition-colors text-white text-sm sm:text-base font-medium rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs">
                                <span className="text-sm sm:text-base font-semibold">✓</span>
                                Approve<span className="hidden sm:inline"> Reservation</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                className="flex-1 h-10 px-3 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 border border-slate-300 text-sm sm:text-base font-medium rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer">
                                <span className="text-sm sm:text-base font-semibold">✕</span>
                                Reject<span className="hidden sm:inline"> Request</span>
                            </button>
                        </div>
                    ) : null}

                    {isConfirmed ? (
                        <div className="w-full mt-4 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={handleReturn}
                                className="w-full sm:w-[calc(50%-8px)] h-10 px-4 bg-green-500 hover:bg-green-600 transition-colors text-white text-base font-medium rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                                <svg
                                    className="w-4 h-4 text-white shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Mark Returned &amp; Stock Feed
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
