import { resolveBookingScheduleStatus } from '@shared/util/booking'
import { getOptimizedImageUrl } from '@shared/util/image'

const defaultBooking = Object.freeze({})

export const BookingCardItem = ({ booking = defaultBooking }) => {
    const scheduleStatus = resolveBookingScheduleStatus(booking)
    const isActive = scheduleStatus === 'active'
    const cardBorderClass = isActive ? 'border-green-500' : 'border-amber-500'

    return (
        <div
            className={`w-full min-h-32 pr-3 lg:pr-9 bg-white rounded-xl border-l-[6px] border-r border-t border-b overflow-hidden flex items-stretch font-['Poppins'] ${cardBorderClass}`}>
            <div className="w-20 lg:w-28 shrink-0 bg-white border-r border-slate-200 p-2 flex items-center justify-center self-stretch">
                {booking.equipmentImage ? (
                    <img
                        src={getOptimizedImageUrl(booking.equipmentImage, 200)}
                        alt={booking.equipmentName}
                        className="w-full h-full object-contain"
                        loading="eager"
                        decoding="async"
                    />
                ) : null}
            </div>

            <div className="flex-1 flex flex-col justify-center gap-2.5 py-3 pl-3 lg:pl-4 min-w-0">
                <div className="self-stretch inline-flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 lg:gap-5 min-w-0">
                        <div className="text-slate-900 text-sm lg:text-lg font-semibold truncate">
                            {booking.equipmentName}
                        </div>
                        {booking.categoryName ? (
                            <div className="px-2 py-1 bg-white rounded-xl outline outline-[0.50px] outline-offset-[-0.50px] outline-slate-300 flex justify-center items-center shrink-0">
                                <div className="text-center text-slate-700 text-xs font-normal">
                                    {booking.categoryName}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    {isActive ? (
                        <div className="h-6 px-1.5 py-1 bg-green-500 rounded-xl inline-flex justify-center items-center gap-2.5 shrink-0">
                            <div className="text-center justify-start text-white text-xs font-semibold font-['Poppins']">
                                ACTIVE
                            </div>
                        </div>
                    ) : (
                        <div className="h-6 px-1.5 py-1 bg-amber-500 rounded-xl inline-flex justify-center items-center gap-2.5 shrink-0">
                            <div className="text-center justify-start text-white text-xs font-semibold font-['Poppins']">
                                PENDING
                            </div>
                        </div>
                    )}
                </div>

                {booking.borrowerName ? (
                    <div className="self-stretch justify-start text-xs truncate">
                        <span className="text-slate-900 font-semibold">Borrower: </span>
                        <span className="text-slate-700 font-normal">
                            {booking.borrowerName}
                            {booking.borrowerDepartment ? ` (${booking.borrowerDepartment})` : ''}
                        </span>
                    </div>
                ) : null}

                <div className="self-stretch inline-flex justify-start items-center gap-1.5 flex-wrap">
                    <div className="text-slate-900 text-xs font-semibold">Period:</div>
                    <div className="p-1 px-2.5 bg-slate-50 rounded-lg outline outline-[0.50px] outline-offset-[-0.50px] outline-slate-300 flex justify-center items-center">
                        <div className="text-slate-700 text-xs font-normal">{booking.periodText}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
