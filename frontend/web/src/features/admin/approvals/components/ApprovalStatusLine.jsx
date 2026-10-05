import { formatShortDate, formatSimpleDate } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { cn } from 'cn'

const defaultBooking = Object.freeze({})

const getBadgeConfig = (status) => {
    if (status === 'approved') {
        return { bg: 'bg-green-100', text: 'text-green-500', label: 'Confirmed' }
    }
    if (status === 'rejected') {
        return { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Rejected' }
    }
    if (status === 'returned') {
        return { bg: 'bg-blue-200', text: 'text-sky-800', label: 'Completed' }
    }
    return { bg: 'bg-orange-50', text: 'text-amber-500', label: 'Pending' }
}

export const ApprovalStatusLine = ({ booking = defaultBooking, mobile = false, className = '' }) => {
    const requestDateText = formatShortDate(booking.created_at)
    const mobileRequestDateText = requestDateText ? formatSimpleDate(booking.created_at) : ''
    const badgeConfig = getBadgeConfig(getBookingStatus(booking))
    const displayDateText = mobile ? mobileRequestDateText : requestDateText

    return (
        <div
            className={cn(
                'flex items-center gap-3 shrink-0',
                mobile ? 'w-full justify-between' : 'sm:ml-auto sm:gap-4',
                className
            )}>
            {displayDateText ? (
                <span
                    className={cn(
                        'text-xs whitespace-nowrap',
                        mobile ? 'text-slate-600 font-medium' : 'text-slate-400 font-mono'
                    )}>
                    {displayDateText}
                </span>
            ) : null}
            <div
                className={cn(
                    'w-[88px] lg:w-auto px-3.5 py-1 rounded-[10px] inline-flex justify-center items-center shrink-0 lg:shrink',
                    badgeConfig.bg
                )}>
                <span
                    className={cn(
                        "text-[10px] font-semibold font-['Poppins'] leading-none text-center",
                        badgeConfig.text
                    )}>
                    {badgeConfig.label}
                </span>
            </div>
        </div>
    )
}
