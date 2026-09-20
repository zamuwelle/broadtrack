import { useCallback, useState } from 'react'
import { SlipStatusBadge } from '@/features/borrow/slips/components/SlipStatusBadge'
import { SlipEquipmentList } from '@/features/borrow/slips/components/SlipEquipmentList'
import { SlipDetailsGrid } from '@/features/borrow/slips/components/SlipDetailsGrid'
import { SlipStatusNotices } from '@/features/borrow/slips/components/SlipStatusNotices'
import { SlipFooter } from '@/features/borrow/slips/components/SlipFooter'
import { downloadBookingSlip } from '@/features/bookings/api/download-slip'
import { getBookingStatus } from '@shared/util/booking'

const defaultBooking = Object.freeze({})
const defaultEquipments = Object.freeze([])
const noop = () => null

const getBorrowerName = (borrower) => borrower?.full_name || borrower?.name || borrower?.email || ''

export const BookingSlipCard = ({ booking = defaultBooking, currentUser, onCancel = noop }) => {
    const [isDownloading, setIsDownloading] = useState(false)

    const status = getBookingStatus(booking)
    const isPending = status === 'pending'
    const borrower = booking.user ?? currentUser
    const borrowerName = getBorrowerName(borrower)
    const borrowerDepartment = borrower?.department || ''
    const equipments = booking.equipments ?? defaultEquipments

    const handleDownloadSlip = useCallback(async () => {
        if (!booking?.id || isDownloading) {
            return
        }
        try {
            setIsDownloading(true)
            await downloadBookingSlip({
                bookingId: booking.id,
                ticketId: booking.ticket_id
            })
        } finally {
            setIsDownloading(false)
        }
    }, [booking?.id, booking?.ticket_id, isDownloading])

    const handleCancelClick = useCallback(() => {
        if (typeof onCancel === 'function') {
            onCancel(booking.id)
        }
    }, [onCancel, booking.id])

    return (
        <div className="w-full max-w-[501px] h-[680px] lg:h-[751px] p-4 lg:p-6 bg-white rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.10)] outline outline-[0.50px] outline-offset-[-0.50px] outline-slate-300 flex flex-col font-['Poppins'] overflow-y-auto overflow-x-hidden">
            <div className="self-stretch inline-flex justify-between items-center shrink-0">
                <div className="w-56 inline-flex flex-col justify-start items-start gap-1.5">
                    <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">
                        TICKET REQUEST
                    </div>
                    <div className="self-stretch justify-start text-slate-900 text-sm font-semibold">
                        {booking.ticket_id}
                    </div>
                </div>
                <SlipStatusBadge status={status} />
            </div>

            <div className="self-stretch h-0 border-b border-slate-200 shrink-0 my-3" />

            <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <SlipEquipmentList equipments={equipments} />
                <SlipDetailsGrid
                    borrowerName={borrowerName}
                    borrowerDepartment={borrowerDepartment}
                    startDate={booking.start_date}
                    endDate={booking.end_date}
                />
                <SlipStatusNotices booking={booking} status={status} />
            </div>

            <SlipFooter
                isPending={isPending}
                ticketId={booking.ticket_id}
                onCancel={handleCancelClick}
                onPrint={handleDownloadSlip}
            />
        </div>
    )
}
