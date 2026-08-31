import { getBookingStatus } from '@shared/util/booking'

const defaultBooking = Object.freeze({})

export const ApprovalNotesDetails = ({ booking = defaultBooking }) => {
    const status = getBookingStatus(booking)
    const isConfirmed = status === 'approved' || status === 'released'
    const isRejected = status === 'rejected'

    return (
        <div className="flex flex-col gap-2.5">
            {booking.purpose ? (
                <div>
                    <span className="font-semibold text-black block mb-0.5">Project/Purpose:</span>
                    <span className="text-slate-600 font-normal leading-relaxed">{booking.purpose}</span>
                </div>
            ) : null}

            {isConfirmed && booking.approval_note ? (
                <div className="w-full max-w-[340px] bg-green-100 border border-green-500 rounded-lg p-2.5 text-xs text-black">
                    <span className="font-semibold">Pickup Note: </span>
                    <span className="font-normal">{booking.approval_note}</span>
                </div>
            ) : null}

            {isRejected ? (
                <div className="w-full max-w-[340px] bg-rose-50 border border-rose-300 rounded-lg p-2.5 text-xs text-black">
                    <span className="font-semibold">Rejection Reason: </span>
                    <span className="font-normal">
                        {booking.rejection_reason || 'The camera is under maintenance.'}
                    </span>
                </div>
            ) : null}
        </div>
    )
}
