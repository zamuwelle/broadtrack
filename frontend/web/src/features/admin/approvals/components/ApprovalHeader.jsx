import { formatShortDate } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'

const defaultBooking = Object.freeze({})

const getBadgeConfig = (status) => {
    if (status === 'approved' || status === 'released') {
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

export const ApprovalHeader = ({ booking = defaultBooking }) => {
    const equipments = booking.equipments || []
    const equipment = equipments[0] || defaultBooking
    const equipmentName = equipment.name || 'Equipment'
    const categoryName = typeof equipment.category === 'string' ? equipment.category : equipment.category?.name || ''
    const requestDateText = formatShortDate(booking.created_at)
    const status = getBookingStatus(booking)
    const badgeConfig = getBadgeConfig(status)

    return (
        <div className="flex flex-wrap items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-slate-900 leading-tight">{equipmentName}</h3>
                {categoryName ? (
                    <div className="inline-flex items-center justify-center min-w-[56px] h-5 px-2.5 bg-white border border-slate-300 rounded-xl">
                        <span className="text-[10px] text-slate-700 font-normal leading-none text-center">
                            {categoryName}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-auto">
                {requestDateText ? <span className="text-xs text-slate-400 font-mono">{requestDateText}</span> : null}
                <div className={`px-3.5 py-1 ${badgeConfig.bg} rounded-[10px] inline-flex justify-center items-center`}>
                    <span
                        className={`${badgeConfig.text} text-[10px] font-semibold font-['Poppins'] leading-none text-center`}>
                        {badgeConfig.label}
                    </span>
                </div>
            </div>
        </div>
    )
}
