import { useCallback, useMemo } from 'react'
import { formatDate, getBookingDateKey } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useEquipment } from '@/features/equipment/api/get-equipment'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useSetState } from '@shared/hooks/useSetState'
import { CalendarHeader } from '@/features/borrow/calendar/components/CalendarHeader'
import { CalendarGrid } from '@/features/borrow/calendar/components/CalendarGrid'
import { CalendarBookingsModal } from '@/features/borrow/calendar/components/CalendarBookingsModal'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Icon } from '@/components/ui/Icon'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

const defaultEmptyArray = Object.freeze([])
const filterParams = Object.freeze({ view: 'calendar' })
const getEquipmentLabel = (equipment) => [equipment.brand, equipment.name].filter(Boolean).join(' ') || equipment.name

const normalizeBookingItem = (booking, equipment) => {
    const borrowerName = booking.user?.full_name || ''
    const borrowerDepartment = booking.user ? booking.user.department || '' : ''
    const startDate = getBookingDateKey(booking.start_date)
    const endDate = getBookingDateKey(booking.end_date)
    const periodText = `${formatDate(booking.start_date)} – ${formatDate(booking.end_date)}`
    const status = getBookingStatus(booking)

    return {
        id: `${booking.id}-${equipment.id}`,
        bookingId: booking.id,
        equipmentId: equipment.id,
        equipmentName: getEquipmentLabel(equipment),
        categoryName:
            (typeof equipment.category === 'string' ? equipment.category : equipment.category?.name) || 'Equipment',
        borrowerName,
        borrowerDepartment,
        periodText,
        startDate,
        endDate,
        rawStartDate: booking.start_date,
        rawEndDate: booking.end_date,
        status,
        equipmentImage: equipment.image
    }
}

const normalizeBookings = (remoteBookings) =>
    remoteBookings
        .filter((booking) => {
            const status = getBookingStatus(booking)
            return status !== 'cancelled' && status !== 'canceled' && status !== 'rejected' && status !== 'returned'
        })
        .flatMap((booking) => {
            const equipments = booking.equipments ?? defaultEmptyArray
            return equipments.map((equipment) => normalizeBookingItem(booking, equipment))
        })

const calculateCalendarDays = (currentMonthDate) => {
    const year = currentMonthDate.getFullYear()
    const monthIndex = currentMonthDate.getMonth()
    const firstDayIndex = new Date(year, monthIndex, 1).getDay()
    const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const totalGridSlots = Math.ceil((firstDayIndex + totalDaysInMonth) / 7) * 7
    const leadingEmptyDays = firstDayIndex
    const trailingEmptyDays = totalGridSlots - (firstDayIndex + totalDaysInMonth)
    const weeksCount = totalGridSlots / 7

    return {
        year,
        monthIndex,
        totalDaysInMonth,
        leadingEmptyDays,
        trailingEmptyDays,
        weeksCount
    }
}

const useCalendarMonthNav = (updateCalendarState) => {
    const goToPreviousMonth = useCallback(() => {
        updateCalendarState((prev) => ({
            selectedDate: null,
            currentMonthDate: new Date(prev.currentMonthDate.getFullYear(), prev.currentMonthDate.getMonth() - 1, 1)
        }))
    }, [updateCalendarState])

    const goToNextMonth = useCallback(() => {
        updateCalendarState((prev) => ({
            selectedDate: null,
            currentMonthDate: new Date(prev.currentMonthDate.getFullYear(), prev.currentMonthDate.getMonth() + 1, 1)
        }))
    }, [updateCalendarState])

    return { goToPreviousMonth, goToNextMonth }
}

const useCalendarPageLogic = () => {
    const [calendarState, updateCalendarState] = useSetState(() => ({
        currentMonthDate: new Date(),
        selectedDate: null,
        selectedEquipmentName: 'All Equipment Bookings'
    }))
    const { currentMonthDate, selectedDate, selectedEquipmentName } = calendarState

    const { data: equipmentList = defaultEmptyArray } = useEquipment()
    const { data: remoteBookings = defaultEmptyArray } = useBookings({ params: filterParams })

    const normalizedBookings = useMemo(() => normalizeBookings(remoteBookings), [remoteBookings])

    const equipmentOptions = useMemo(
        () => [
            'All Equipment Bookings',
            ...new Set(equipmentList.map((equipment) => getEquipmentLabel(equipment)).filter(Boolean))
        ],
        [equipmentList]
    )

    const filteredBookings = useMemo(() => {
        if (selectedEquipmentName === 'All Equipment Bookings') {
            return normalizedBookings
        }
        return normalizedBookings.filter((item) => item.equipmentName === selectedEquipmentName)
    }, [normalizedBookings, selectedEquipmentName])

    const calendarDays = useMemo(() => calculateCalendarDays(currentMonthDate), [currentMonthDate])

    const { goToPreviousMonth, goToNextMonth } = useCalendarMonthNav(updateCalendarState)

    const handleSelectDate = useCallback(
        (dateKey) => {
            updateCalendarState({ selectedDate: dateKey })
        },
        [updateCalendarState]
    )

    const handleCloseModal = useCallback(() => {
        updateCalendarState({ selectedDate: null })
    }, [updateCalendarState])

    const handleEquipmentFilterChange = useCallback(
        (name) => {
            updateCalendarState({ selectedEquipmentName: name })
        },
        [updateCalendarState]
    )

    const selectedBookingsForActiveDay = useMemo(() => {
        if (!selectedDate) {
            return defaultEmptyArray
        }
        return filteredBookings.filter((item) => item.startDate <= selectedDate && selectedDate <= item.endDate)
    }, [filteredBookings, selectedDate])

    const uniqueBookingsCount = useMemo(
        () => new Set(selectedBookingsForActiveDay.map((item) => item.bookingId)).size,
        [selectedBookingsForActiveDay]
    )

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) {
            return ''
        }
        return new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }, [selectedDate])

    const monthYearHeader = currentMonthDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return {
        selectedEquipmentName,
        equipmentOptions,
        handleEquipmentFilterChange,
        monthYearHeader,
        goToPreviousMonth,
        goToNextMonth,
        calendarDays,
        selectedDate,
        filteredBookings,
        handleSelectDate,
        handleCloseModal,
        formattedSelectedDate,
        selectedBookingsForActiveDay,
        uniqueBookingsCount
    }
}

export const CalendarPage = () => {
    useDocumentTitle('Scheduling Calendar')
    const {
        selectedEquipmentName,
        equipmentOptions,
        handleEquipmentFilterChange,
        monthYearHeader,
        goToPreviousMonth,
        goToNextMonth,
        calendarDays,
        selectedDate,
        filteredBookings,
        handleSelectDate,
        handleCloseModal,
        formattedSelectedDate,
        selectedBookingsForActiveDay,
        uniqueBookingsCount
    } = useCalendarPageLogic()

    const { year, monthIndex, totalDaysInMonth, leadingEmptyDays, trailingEmptyDays, weeksCount } = calendarDays

    return (
        <div className="flex-1 flex flex-col gap-3.5 lg:gap-4 w-full font-['Poppins'] lg:min-h-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Scheduling Calendar</h1>
                    <p className="text-sm text-slate-500 font-normal">Check active and pending broadcast rentals</p>
                </div>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4 w-full lg:w-auto">
                    <CalendarHeader
                        monthYearHeader={monthYearHeader}
                        onPreviousMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                    />
                    <FilterDropdown
                        value={selectedEquipmentName}
                        onChange={handleEquipmentFilterChange}
                        options={equipmentOptions}
                        className="w-full lg:w-[280px] shrink-0"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-4 lg:flex-1 lg:min-h-0">
                <CalendarGrid
                    year={year}
                    monthIndex={monthIndex}
                    totalDaysInMonth={totalDaysInMonth}
                    leadingEmptyDays={leadingEmptyDays}
                    trailingEmptyDays={trailingEmptyDays}
                    selectedDate={selectedDate}
                    filteredBookings={filteredBookings}
                    onSelectDate={handleSelectDate}
                    weeksCount={weeksCount}
                />

                <div className="border-t border-slate-200 shrink-0" />

                <div className="bg-zinc-100/50 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 px-4 py-2.5 flex items-center gap-2.5 text-slate-500 text-xs shrink-0">
                    <Icon name="info" className="w-4 h-4 shrink-0 opacity-70" />
                    <span>
                        Tap on any calendar day with colored markers (🟢 Active, 🟡 Pending) to view scheduling
                        conflicts or active rentals.
                    </span>
                </div>
            </div>

            <CalendarBookingsModal
                isOpen={Boolean(selectedDate)}
                onClose={handleCloseModal}
                formattedSelectedDate={formattedSelectedDate}
                bookings={selectedBookingsForActiveDay}
                totalBookingsCount={uniqueBookingsCount}
            />
        </div>
    )
}
