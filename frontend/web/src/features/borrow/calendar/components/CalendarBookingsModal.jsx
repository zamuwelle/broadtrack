import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { XButton } from '@/components/ui/XButton'
import { BookingCardItem } from '@/features/borrow/calendar/components/BookingCardItem'

const defaultBookings = Object.freeze([])
const noop = () => null

export const CalendarBookingsModal = ({
    isOpen = false,
    onClose = noop,
    formattedSelectedDate = '',
    bookings = defaultBookings,
    totalBookingsCount = null
}) => {
    useEscapeKey(onClose)

    if (!isOpen) {
        return null
    }

    const displayCount = totalBookingsCount ?? bookings.length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-['Poppins']">
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs border-none outline-none cursor-default"
            />
            <div className="bg-white rounded-2xl w-full max-w-[760px] lg:max-w-[880px] p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-6 shadow-2xl relative z-10 max-h-[88dvh] overflow-y-scroll my-auto">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base lg:text-lg font-medium text-slate-900 tracking-wide uppercase">
                        BOOKING FOR {formattedSelectedDate}
                    </h3>
                    <div className="flex items-center gap-4 shrink-0">
                        {bookings.length > 0 ? (
                            <div className="h-6 px-2.5 py-1 bg-sky-800 rounded-xl outline outline-[0.50px] outline-offset-[-0.50px] outline-sky-800 flex justify-center items-center">
                                <span className="text-center text-white text-xs font-bold">
                                    {displayCount} {displayCount === 1 ? 'Booking' : 'Bookings'}
                                </span>
                            </div>
                        ) : null}
                        <XButton onClick={onClose} className="size-7 flex items-center justify-center cursor-pointer" />
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="w-full h-16 bg-zinc-100/50 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center px-4">
                        <span className="text-slate-600 text-sm font-normal text-center">
                            No active rentals scheduled for this day. Fully available!
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {bookings.map((booking) => (
                            <BookingCardItem key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
