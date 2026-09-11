import { formatDate } from '@shared/util/date'

const renderReturnNotice = (booking) => (
    <div className="w-full p-2.5 bg-blue-600/10 rounded-lg outline outline-[0.50px] outline-offset-[-0.50px] outline-blue-600 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
            <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M6.5 10.2L8.8 12.5L13.5 7.5" stroke="#3B82F6" strokeWidth="1.5" />
            </svg>
            <div className="flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-blue-600 text-xs font-semibold">ACTUAL RETURN DATE</div>
                <div className="self-stretch justify-start text-slate-900 text-xs font-normal">
                    {formatDate(booking.return_date || booking.end_date)}
                </div>
            </div>
        </div>
        <div className="h-6 px-2.5 py-0.5 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-center text-blue-600 text-xs font-semibold">STOCK DISCHARGED</span>
        </div>
    </div>
)

const renderPickupNotice = (approvalNote) => (
    <div className="w-full p-2.5 bg-green-500/20 outline-green-500 rounded-lg outline outline-[0.50px] outline-offset-[-0.50px] flex items-start gap-2">
        <svg className="size-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="#22C55E" strokeWidth="1.5" />
            <path
                d="M6.5 10.2L8.8 12.5L13.5 7.5"
                stroke="#22C55E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <div className="flex-1 flex flex-col justify-start items-start">
            <div className="self-stretch justify-start text-green-500 text-xs font-semibold">PICKUP NOTES:</div>
            <div className="self-stretch justify-start text-slate-900 text-xs font-normal">{approvalNote}</div>
        </div>
    </div>
)

const renderRefusalNotice = (rejectionReason) => (
    <div className="w-full p-2.5 bg-red-500/15 outline-red-400 rounded-lg outline outline-[0.50px] outline-offset-[-0.50px] flex items-start gap-2">
        <svg className="size-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="#EF4444" strokeWidth="1.5" />
            <path
                d="M7 7L13 13M13 7L7 13"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <div className="flex-1 flex flex-col justify-start items-start">
            <div className="self-stretch justify-start text-red-700 text-xs font-semibold">ADMIN REFUSAL REASON:</div>
            <div className="self-stretch justify-start text-slate-900 text-xs font-normal">{rejectionReason}</div>
        </div>
    </div>
)

export const SlipStatusNotices = ({ booking, status }) => {
    const isApproved = status === 'approved'
    const isReturned = status === 'returned'
    const isRejected = status === 'rejected'
    const showPickup = (isApproved || isReturned) && Boolean(booking.approval_note)
    const showRefusal = isRejected && Boolean(booking.rejection_reason)

    return (
        <>
            {isReturned ? renderReturnNotice(booking) : null}

            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">PURPOSE / NOTES:</div>
                <div className="self-stretch justify-start text-slate-900 text-xs font-normal break-words">
                    {booking.purpose}
                </div>
            </div>

            {showPickup ? renderPickupNotice(booking.approval_note) : null}
            {showRefusal ? renderRefusalNotice(booking.rejection_reason) : null}
        </>
    )
}
