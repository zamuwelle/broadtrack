import { useCallback, useMemo, useRef, useState } from 'react'
import {
    addBookingMinutes,
    getBookingDateKey,
    getBookingDateTimeValue,
    getCurrentBookingDateTimeValue,
    getNextBookingHourValue,
    parseBookingDate
} from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useUser } from '@/lib/auth'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useCreateBooking } from '@/features/bookings/api/create-booking'
import { useBookingDateDefaults } from '@/features/borrow/request/useBookingDateDefaults'
import { useSetState } from '@shared/hooks/useSetState'

const filterParams = Object.freeze({ view: 'calendar' })

const isBookedStatus = (status) => status === 'approved'

const hasEquipment = (bookingEquipments, selectedId) => {
    if (!bookingEquipments) {
        return false
    }
    for (const item of bookingEquipments) {
        if (item.id === selectedId) {
            return true
        }
    }
    return false
}

const hasEquipmentOverlap = (booking, selectedItems) => {
    for (const selected of selectedItems) {
        if (hasEquipment(booking.equipments, selected.id)) {
            return true
        }
    }
    return false
}

const computeMinStartDate = (remoteBookings, selectedItems, minimumDateTime) => {
    const activeItemEndDates = []
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        const startDatePrefix = getBookingDateKey(booking.start_date)
        const isOngoing = isBookedStatus(status) && startDatePrefix <= minimumDateTime.slice(0, 10)
        if (isOngoing && hasEquipmentOverlap(booking, selectedItems) && booking.end_date) {
            activeItemEndDates.push(booking.end_date)
        }
    }

    const latestActiveEndDate = activeItemEndDates
        .map((dateValue) => ({ dateValue, timestamp: parseBookingDate(dateValue)?.getTime() }))
        .filter(({ timestamp }) => Number.isFinite(timestamp))
        .toSorted((first, second) => second.timestamp - first.timestamp)[0]?.dateValue
    const latestActiveEndDateTime = latestActiveEndDate ? getBookingDateTimeValue(latestActiveEndDate) : ''
    return latestActiveEndDateTime > minimumDateTime ? latestActiveEndDateTime : minimumDateTime
}

const computeExcludeDateIntervals = (remoteBookings, selectedItems) => {
    const intervals = []
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        if (
            isBookedStatus(status) &&
            hasEquipmentOverlap(booking, selectedItems) &&
            booking.start_date &&
            booking.end_date
        ) {
            intervals.push({
                start: new Date(booking.start_date),
                end: new Date(booking.end_date)
            })
        }
    }
    return intervals
}

const isOverlappingInterval = (booking, startDate, endDate) => {
    const bookingStart = parseBookingDate(booking.start_date)?.getTime()
    const bookingEnd = parseBookingDate(booking.end_date)?.getTime()
    const requestedStart = parseBookingDate(startDate)?.getTime()
    const requestedEnd = parseBookingDate(endDate)?.getTime()
    return (
        Number.isFinite(bookingStart) &&
        Number.isFinite(bookingEnd) &&
        Number.isFinite(requestedStart) &&
        Number.isFinite(requestedEnd) &&
        bookingStart < requestedEnd &&
        requestedStart < bookingEnd
    )
}

const checkScheduleConflict = (startDate, endDate, remoteBookings, selectedItems) => {
    if (!startDate || !endDate) {
        return false
    }
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        if (
            isBookedStatus(status) &&
            hasEquipmentOverlap(booking, selectedItems) &&
            isOverlappingInterval(booking, startDate, endDate)
        ) {
            return true
        }
    }
    return false
}

const initialSummaryState = Object.freeze({
    modalView: 'summary',
    startDate: '',
    endDate: '',
    purpose: '',
    isSubmitting: false
})

const useBorrowSubmitHandler = ({
    createBookingMutation,
    isSubmittable,
    isSubmitting,
    selectedItems,
    purpose,
    startDate,
    endDate,
    updateSummaryState,
    clearBasket,
    setErrorMessage
}) =>
    useCallback(async () => {
        if (!isSubmittable || isSubmitting) {
            return
        }
        setErrorMessage('')
        updateSummaryState({ isSubmitting: true })
        try {
            await createBookingMutation.mutateAsync({
                equipment_ids: selectedItems.map((item) => item.id),
                purpose,
                start_date: startDate,
                end_date: endDate
            })
            updateSummaryState({
                modalView: 'submitted',
                startDate: '',
                endDate: '',
                purpose: ''
            })
            clearBasket()
        } catch (submitError) {
            setErrorMessage(
                submitError?.message || 'Failed to submit booking request. Please check dates and try again.'
            )
        } finally {
            updateSummaryState({ isSubmitting: false })
        }
    }, [
        createBookingMutation,
        isSubmittable,
        isSubmitting,
        updateSummaryState,
        selectedItems,
        purpose,
        startDate,
        endDate,
        clearBasket,
        setErrorMessage
    ])

const useBorrowFieldHandlers = ({
    updateSummaryState,
    removeItem,
    selectedItems,
    summaryState,
    remoteBookings,
    setErrorMessage,
    startDateIsAutomaticRef,
    endDateIsAutomaticRef
}) => {
    const handleStartDateChange = useCallback(
        (event) => {
            const selectedDate = event?.target?.value ?? event
            let newEndDate = summaryState.endDate
            if (endDateIsAutomaticRef.current || (summaryState.endDate && selectedDate >= summaryState.endDate)) {
                newEndDate = getNextBookingHourValue(selectedDate)
            }

            const hasConflict = checkScheduleConflict(selectedDate, newEndDate, remoteBookings, selectedItems)
            startDateIsAutomaticRef.current = false
            if (hasConflict) {
                setErrorMessage('Selected date conflicts with an existing reservation.')
                updateSummaryState({
                    startDate: selectedDate,
                    endDate: newEndDate
                })
                return
            }

            setErrorMessage('')
            updateSummaryState({
                startDate: selectedDate,
                endDate: newEndDate
            })
        },
        [
            updateSummaryState,
            summaryState.endDate,
            remoteBookings,
            selectedItems,
            setErrorMessage,
            startDateIsAutomaticRef,
            endDateIsAutomaticRef
        ]
    )

    const handleEndDateChange = useCallback(
        (event) => {
            const selectedDate = event?.target?.value ?? event
            let newStartDate = summaryState.startDate
            if (summaryState.startDate && selectedDate <= summaryState.startDate) {
                newStartDate = addBookingMinutes(selectedDate, -60)
            }

            const hasConflict = checkScheduleConflict(newStartDate, selectedDate, remoteBookings, selectedItems)
            if (newStartDate !== summaryState.startDate) {
                startDateIsAutomaticRef.current = false
            }
            endDateIsAutomaticRef.current = false
            if (hasConflict) {
                setErrorMessage('Selected date conflicts with an existing reservation.')
                updateSummaryState({
                    endDate: selectedDate,
                    startDate: newStartDate
                })
                return
            }

            setErrorMessage('')
            updateSummaryState({
                endDate: selectedDate,
                startDate: newStartDate
            })
        },
        [
            updateSummaryState,
            summaryState.startDate,
            remoteBookings,
            selectedItems,
            setErrorMessage,
            startDateIsAutomaticRef,
            endDateIsAutomaticRef
        ]
    )

    const handleRemoveItem = useCallback(
        (itemId) => {
            removeItem(itemId)
            if (selectedItems.length <= 1) {
                updateSummaryState({ modalView: 'empty' })
            }
        },
        [removeItem, selectedItems.length, updateSummaryState]
    )

    const handlePurposeChange = useCallback(
        (event) => {
            updateSummaryState({ purpose: event.target.value })
        },
        [updateSummaryState]
    )

    return {
        handleStartDateChange,
        handleEndDateChange,
        handleRemoveItem,
        handlePurposeChange
    }
}

export const useBorrowSummaryLogic = ({ isOpen, propUser }) => {
    const { data: activeUser } = useUser()
    const user = activeUser ?? propUser
    const selectedItems = useBookingCartStore((state) => state.items)
    const removeItem = useBookingCartStore((state) => state.removeItem)
    const clearCart = useBookingCartStore((state) => state.clearCart)
    const { data: remoteBookings = [] } = useBookings({ params: filterParams })
    const createBookingMutation = useCreateBooking()
    const [errorMessage, setErrorMessage] = useState('')
    const [minuteTick, setMinuteTick] = useState(Date.now)
    const startDateIsAutomaticRef = useRef(true)
    const endDateIsAutomaticRef = useRef(true)

    const [summaryState, updateSummaryState] = useSetState({
        ...initialSummaryState,
        modalView: selectedItems.length > 0 ? 'summary' : 'empty'
    })
    const { modalView, startDate, endDate, purpose, isSubmitting } = summaryState

    const minimumDateTime = getCurrentBookingDateTimeValue(new Date(minuteTick))
    useBookingDateDefaults({
        isOpen,
        modalView,
        minuteTick,
        selectedItemCount: selectedItems.length,
        updateSummaryState,
        setMinuteTick,
        startDateIsAutomaticRef,
        endDateIsAutomaticRef
    })

    const minStartDate = useMemo(
        () => computeMinStartDate(remoteBookings, selectedItems, minimumDateTime),
        [remoteBookings, selectedItems, minimumDateTime]
    )

    const excludeDateIntervals = useMemo(
        () => computeExcludeDateIntervals(remoteBookings, selectedItems),
        [remoteBookings, selectedItems]
    )

    const hasScheduleConflict = useMemo(
        () => checkScheduleConflict(startDate, endDate, remoteBookings, selectedItems),
        [startDate, endDate, remoteBookings, selectedItems]
    )

    const isDateRangeValid = !startDate || !endDate || (startDate >= minStartDate && startDate < endDate)
    const isSubmittable = Boolean(
        !isSubmitting &&
        startDate &&
        endDate &&
        isDateRangeValid &&
        !hasScheduleConflict &&
        purpose.trim() &&
        selectedItems.length > 0
    )

    const handlers = useBorrowFieldHandlers({
        updateSummaryState,
        removeItem,
        selectedItems,
        summaryState,
        remoteBookings,
        setErrorMessage,
        startDateIsAutomaticRef,
        endDateIsAutomaticRef
    })

    const handleSubmit = useBorrowSubmitHandler({
        createBookingMutation,
        isSubmittable,
        isSubmitting,
        selectedItems,
        purpose,
        startDate,
        endDate,
        updateSummaryState,
        clearBasket: clearCart,
        setErrorMessage
    })

    return {
        user,
        selectedItems,
        modalView,
        startDate,
        endDate,
        minStartDate,
        excludeDateIntervals,
        hasScheduleConflict,
        purpose,
        isSubmittable,
        isSubmitting,
        errorMessage,
        ...handlers,
        handleSubmit
    }
}
