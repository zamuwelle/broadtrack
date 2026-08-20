import { useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDate } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { getEquipmentStatus } from '@shared/util/equipment'
import { useBookings } from '@/hooks/queries/useBookings'

const filterParams = Object.freeze({ all: 1 })
const defaultEquipment = Object.freeze({})

const isExcludedStatus = (status) =>
    status === 'cancelled' || status === 'canceled' || status === 'rejected' || status === 'returned'

export const ScheduleNotice = ({ status, equipment = defaultEquipment }) => {
    const normalizedStatus = getEquipmentStatus(status)
    const { data: remoteBookings = [] } = useBookings(filterParams)
    const equipmentId = equipment?.id ?? null

    const activeRanges = useMemo(() => {
        const activeBookings = remoteBookings.filter((booking) => {
            const bookingStatus = getBookingStatus(booking)
            if (isExcludedStatus(bookingStatus)) {
                return false
            }
            return booking.equipments ? booking.equipments.some((item) => item.id === equipmentId) : false
        })

        if (activeBookings.length === 0) {
            return null
        }

        return activeBookings.map((booking) => ({
            start: formatDate(booking.start_date),
            end: formatDate(booking.end_date)
        }))
    }, [remoteBookings, equipmentId])

    return (
        <div className="w-full px-4 py-2.5 bg-zinc-100/40 rounded-lg outline outline-1 outline-offset-[-1px] outline-border-divider inline-flex flex-col justify-center items-start gap-2.5 font-['Poppins']">
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch inline-flex justify-start items-center gap-3">
                    <Icon name="calendar" className="size-5 text-muted shrink-0" fill="currentColor" />
                    <div className="text-muted text-sm font-normal">Showing scheduled dates for this item:</div>
                </div>

                {normalizedStatus === 'available' ? (
                    <div className="self-stretch px-2.5 py-1.5 bg-green-100/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-green-500 flex items-center justify-center gap-2">
                        <svg className="h-[12px] w-[16px] text-green-500 shrink-0" viewBox="0 0 16 12" fill="none">
                            <path
                                d="M1 6.5L5.5 11L15 1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="text-center text-green-600 text-xs font-semibold">
                            FULLY AVAILABLE FOR THIS PERIOD.
                        </div>
                    </div>
                ) : null}

                {normalizedStatus === 'maintenance' ? (
                    <div className="self-stretch px-2.5 py-1.5 bg-orange-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-amber-500 flex items-center justify-center gap-2">
                        <span className="text-xs">🛠</span>
                        <div className="text-center text-amber-600 text-xs font-semibold">
                            OUT OF SERVICE FOR MAINTENANCE
                        </div>
                    </div>
                ) : null}

                {normalizedStatus === 'borrowed' || normalizedStatus === 'booked' ? (
                    <div className="self-stretch px-2.5 py-1.5 bg-blue-200/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-sky-800 flex flex-col justify-center items-center gap-2">
                        <div className="self-stretch px-1 inline-flex justify-center items-center gap-1.5">
                            <Icon name="calendar" className="size-4 text-sky-800 shrink-0" fill="currentColor" />
                            <div className="text-center text-sky-800 text-xs font-semibold">
                                ALREADY BORROWED ON CERTAIN DATES:
                            </div>
                        </div>
                        {activeRanges ? (
                            activeRanges.map((range) => (
                                <div
                                    key={`range-${range.start}-${range.end}`}
                                    className="self-stretch p-1.5 bg-slate-50 rounded-lg flex flex-wrap justify-center items-center gap-x-1.5 gap-y-0.5 text-slate-800 text-xs font-medium text-center">
                                    <span className="whitespace-nowrap">{range.start}</span>
                                    <span className="text-slate-400">–</span>
                                    <span className="whitespace-nowrap">{range.end}</span>
                                </div>
                            ))
                        ) : (
                            <div className="self-stretch p-1.5 bg-slate-50 rounded-lg inline-flex justify-center items-center">
                                <div className="text-slate-800 text-xs font-medium text-center">
                                    Currently scheduled — review calendar for updates
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
