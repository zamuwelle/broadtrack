import { useCallback, useMemo, useRef, useState } from 'react'
import {
    addBookingMinutes,
    formatBookingTimeRange,
    getBookingDateKey,
    getBookingDateTimeValue,
    getCurrentBookingDateTimeValue,
    getNextBookingHourValue,
    parseBookingDate
} from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useToast } from '@/hooks/ui/useToast'
import { useUser } from '@/lib/auth'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useCreateBooking } from '@/features/bookings/api/create-booking'
import { useBookingDateDefaults } from '@/features/borrow/request/useBookingDateDefaults'
import { useSetState } from '@shared/hooks/useSetState'

const filterParams = Object.freeze({ view: 'calendar' })
const isBookedStatus = (status) => status === 'approved'
const hasEquipment = (equipments, id) => equipments?.some((item) => item.id === id) ?? false
const hasEquipmentOverlap = (booking, selectedItems) =>
    selectedItems.some((selected) => hasEquipment(booking.equipments, selected.id))

const computeMinStartDate = (remoteBookings, selectedItems, minimumDateTime) => {
    const activeItemEndDates = []
    for (const booking of remoteBookings) {
        const isOngoing =
            isBookedStatus(getBookingStatus(booking)) &&
            getBookingDateKey(booking.start_date) <= minimumDateTime.slice(0, 10)
        if (isOngoing && hasEquipmentOverlap(booking, selectedItems) && booking.end_date) {
            activeItemEndDates.push(booking.end_date)
        }
    }
    const latestActiveEndDate = activeItemEndDates
        .map((dateValue) => ({ dateValue, timestamp: parseBookingDate(dateValue)?.getTime() }))
        .filter(({ timestamp }) => Number.isFinite(timestamp))
        .toSorted((first, second) => second.timestamp - first.timestamp)[0]?.dateValue
    const latestTime = latestActiveEndDate ? getBookingDateTimeValue(latestActiveEndDate) : ''
    return latestTime > minimumDateTime ? latestTime : minimumDateTime
}

const computeExcludeDateIntervals = (remoteBookings, selectedItems) =>
    remoteBookings
        .filter((item) => isBookedStatus(getBookingStatus(item)) && hasEquipmentOverlap(item, selectedItems) && item.start_date && item.end_date)
        .map((item) => ({ start: new Date(item.start_date), end: new Date(item.end_date) }))

const isOverlappingInterval = (booking, startDate, endDate) => {
    const bookingStart = parseBookingDate(booking.start_date)?.getTime()
    const bookingEnd = parseBookingDate(booking.end_date)?.getTime()
    const reqStart = parseBookingDate(startDate)?.getTime()
    const reqEnd = parseBookingDate(endDate)?.getTime()
    return Boolean(
        Number.isFinite(bookingStart) && Number.isFinite(bookingEnd) &&
        Number.isFinite(reqStart) && Number.isFinite(reqEnd) &&
        bookingStart < reqEnd && reqStart < bookingEnd
    )
}

const isMatchingBooking = (booking, selectedItems, startDate, endDate) =>
    isBookedStatus(getBookingStatus(booking)) &&
    hasEquipmentOverlap(booking, selectedItems) &&
    isOverlappingInterval(booking, startDate, endDate)

const inspectBookingConflict = (booking, requestedStart, requestedEnd) => {
    const bookingStart = parseBookingDate(booking.start_date)?.getTime()
    const bookingEnd = parseBookingDate(booking.end_date)?.getTime()
    const valid = Number.isFinite(bookingStart) && Number.isFinite(bookingEnd)
    return {
        startIn: valid && requestedStart >= bookingStart && requestedStart < bookingEnd,
        endIn: valid && requestedEnd > bookingStart && requestedEnd <= bookingEnd,
        wraps: valid && requestedStart < bookingStart && requestedEnd > bookingEnd
    }
}

const isSameDayBooking = (booking, targetDateKey) => {
    const startKey = getBookingDateKey(booking.start_date)
    const endKey = getBookingDateKey(booking.end_date)
    return Boolean(startKey && endKey && startKey <= targetDateKey && endKey >= targetDateKey)
}

const findHelperBooking = ({ remoteBookings, selectedItems, targetDateKey, autoStartDate, minimumDateTime }) => {
    if (!targetDateKey) {
        return null
    }

    const dayBookings = remoteBookings.filter(
        (booking) =>
            isBookedStatus(getBookingStatus(booking)) &&
            hasEquipmentOverlap(booking, selectedItems) &&
            isSameDayBooking(booking, targetDateKey)
    )

    if (dayBookings.length === 0) {
        return null
    }

    if (autoStartDate > minimumDateTime) {
        const ongoingBooking = dayBookings.find(
            (booking) => getBookingDateTimeValue(booking.end_date) === autoStartDate
        )
        if (ongoingBooking) {
            return ongoingBooking
        }
    }

    return dayBookings[0]
}

const getConflictMessage = (hasScheduleConflict, conflictingBooking) => {
    if (!hasScheduleConflict) {
        return ''
    }
    if (conflictingBooking) {
        const range = formatBookingTimeRange(conflictingBooking.start_date, conflictingBooking.end_date)
        if (range) {
            return `Already booked (${range}).`
        }
    }
    return 'Selected date conflicts with an existing reservation.'
}

const scanOverlappingBookings = ({
    remoteBookings,
    selectedItems,
    startDate,
    endDate,
    requestedStart,
    requestedEnd
}) => {
    let startIn = false
    let endIn = false
    let wraps = false
    let conflictingBooking = null

    for (const booking of remoteBookings) {
        if (isMatchingBooking(booking, selectedItems, startDate, endDate)) {
            conflictingBooking ||= booking
            const conflict = inspectBookingConflict(booking, requestedStart, requestedEnd)
            startIn ||= conflict.startIn
            endIn ||= conflict.endIn
            wraps ||= conflict.wraps
        }
    }
    return { startIn, endIn, wraps, conflictingBooking }
}

const checkDateConflictBreakdown = ({ startDate, endDate, remoteBookings, selectedItems, minStartDate }) => {
    if (!startDate || !endDate) {
        return { hasStartConflict: false, hasEndConflict: false, hasScheduleConflict: false, conflictMessage: '' }
    }
    const requestedStart = parseBookingDate(startDate)?.getTime()
    const requestedEnd = parseBookingDate(endDate)?.getTime()
    const { startIn, endIn, wraps, conflictingBooking } = scanOverlappingBookings({
        remoteBookings,
        selectedItems,
        startDate,
        endDate,
        requestedStart,
        requestedEnd
    })

    const hasStartConflict = Boolean((minStartDate && startDate < minStartDate) || startIn)
    const hasEndConflict = Boolean(endDate <= startDate || endIn || wraps)
    const hasScheduleConflict = Boolean(hasStartConflict || hasEndConflict)
    const conflictMessage = getConflictMessage(hasScheduleConflict, conflictingBooking)

    return { hasStartConflict, hasEndConflict, hasScheduleConflict, conflictMessage }
}

const computeHelperMessage = ({
    hasScheduleConflict,
    remoteBookings,
    selectedItems,
    startDate,
    autoStartDate,
    minimumDateTime
}) => {
    if (hasScheduleConflict) {
        return ''
    }
    const booking = findHelperBooking({
        remoteBookings,
        selectedItems,
        targetDateKey: getBookingDateKey(startDate || minimumDateTime),
        autoStartDate,
        minimumDateTime
    })
    if (!booking) {
        return ''
    }
    const range = formatBookingTimeRange(booking.start_date, booking.end_date)
    return range ? `Already booked (${range}).` : ''
}

const initialSummaryState = Object.freeze({
    modalView: 'summary',
    startDate: '',
    endDate: '',
    purpose: '',
    errorMessage: ''
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
    setErrorMessage,
    showToast
}) =>
    useCallback(async () => {
        if (!isSubmittable || isSubmitting) {
            return
        }
        setErrorMessage('')
        try {
            await createBookingMutation.mutateAsync({
                equipment_ids: selectedItems.map((item) => item.id),
                purpose,
                start_date: startDate,
                end_date: endDate
            })
            updateSummaryState({ modalView: 'submitted', startDate: '', endDate: '', purpose: '' })
            clearBasket()
        } catch (submitError) {
            const message = submitError?.message || 'Failed to submit booking request. Please check dates and try again.'
            setErrorMessage(message)
            showToast(message, 'danger')
        }
    }, [
        createBookingMutation, isSubmittable, isSubmitting, updateSummaryState,
        selectedItems, purpose, startDate, endDate, clearBasket, setErrorMessage, showToast
    ])

const useBorrowFieldHandlers = ({
    updateSummaryState,
    removeItem,
    selectedItems,
    summaryState,
    remoteBookings,
    setErrorMessage,
    minStartDate,
    startDateIsAutomaticRef,
    endDateIsAutomaticRef
}) => {
    const handleStartDateChange = useCallback(
        (event) => {
            const selectedDate = event?.target?.value ?? event
            const shouldAutoEnd =
                endDateIsAutomaticRef.current || (summaryState.endDate && selectedDate >= summaryState.endDate)
            const newEndDate = shouldAutoEnd ? getNextBookingHourValue(selectedDate) : summaryState.endDate

            const { hasScheduleConflict, conflictMessage } = checkDateConflictBreakdown({
                startDate: selectedDate,
                endDate: newEndDate,
                remoteBookings,
                selectedItems,
                minStartDate
            })
            startDateIsAutomaticRef.current = false
            setErrorMessage(hasScheduleConflict ? conflictMessage : '')
            updateSummaryState({ startDate: selectedDate, endDate: newEndDate })
        },
        [
            updateSummaryState, summaryState.endDate, remoteBookings, selectedItems,
            setErrorMessage, minStartDate, startDateIsAutomaticRef, endDateIsAutomaticRef
        ]
    )

    const handleEndDateChange = useCallback(
        (event) => {
            const selectedDate = event?.target?.value ?? event
            const shouldAutoStart = summaryState.startDate && selectedDate <= summaryState.startDate
            const newStartDate = shouldAutoStart ? addBookingMinutes(selectedDate, -60) : summaryState.startDate

            const { hasScheduleConflict, conflictMessage } = checkDateConflictBreakdown({
                startDate: newStartDate,
                endDate: selectedDate,
                remoteBookings,
                selectedItems,
                minStartDate
            })
            if (newStartDate !== summaryState.startDate) {
                startDateIsAutomaticRef.current = false
            }
            endDateIsAutomaticRef.current = false
            setErrorMessage(hasScheduleConflict ? conflictMessage : '')
            updateSummaryState({ endDate: selectedDate, startDate: newStartDate })
        },
        [
            updateSummaryState, summaryState.startDate, remoteBookings, selectedItems,
            setErrorMessage, minStartDate, startDateIsAutomaticRef, endDateIsAutomaticRef
        ]
    )

    const handleRemoveItem = useCallback((itemId) => {
        removeItem(itemId)
        if (selectedItems.length <= 1) {
            updateSummaryState({ modalView: 'empty' })
        }
    }, [removeItem, selectedItems.length, updateSummaryState])

    const handlePurposeChange = useCallback((event) => {
        updateSummaryState({ purpose: event.target.value })
    }, [updateSummaryState])

    return { handleStartDateChange, handleEndDateChange, handleRemoveItem, handlePurposeChange }
}

export const useBorrowSummaryLogic = ({ isOpen, propUser }) => {
    const { show: showToast } = useToast()
    const { data: activeUser } = useUser()
    const user = activeUser ?? propUser
    const selectedItems = useBookingCartStore((state) => state.items)
    const removeItem = useBookingCartStore((state) => state.removeItem)
    const clearCart = useBookingCartStore((state) => state.clearCart)
    const { data: remoteBookings = [] } = useBookings({ params: filterParams })
    const createBookingMutation = useCreateBooking()
    const isSubmitting = createBookingMutation.isPending
    const [minuteTick, setMinuteTick] = useState(Date.now)
    const startDateIsAutomaticRef = useRef(true)
    const endDateIsAutomaticRef = useRef(true)

    const [summaryState, updateSummaryState] = useSetState({
        ...initialSummaryState,
        modalView: selectedItems.length > 0 ? 'summary' : 'empty'
    })
    const { modalView, startDate, endDate, purpose, errorMessage } = summaryState

    const setErrorMessage = useCallback(
        (nextErrorMessage) => updateSummaryState({ errorMessage: nextErrorMessage }),
        [updateSummaryState]
    )

    const minimumDateTime = getCurrentBookingDateTimeValue(new Date(minuteTick))
    const minStartDate = minimumDateTime

    const autoStartDate = useMemo(
        () => computeMinStartDate(remoteBookings, selectedItems, minimumDateTime),
        [remoteBookings, selectedItems, minimumDateTime]
    )

    useBookingDateDefaults({
        isOpen,
        modalView,
        minuteTick,
        minStartDate: autoStartDate,
        selectedItemCount: selectedItems.length,
        updateSummaryState,
        setMinuteTick,
        startDateIsAutomaticRef,
        endDateIsAutomaticRef
    })

    const excludeDateIntervals = useMemo(
        () => computeExcludeDateIntervals(remoteBookings, selectedItems),
        [remoteBookings, selectedItems]
    )

    const { hasStartConflict, hasEndConflict, hasScheduleConflict, conflictMessage } = useMemo(
        () => checkDateConflictBreakdown({ startDate, endDate, remoteBookings, selectedItems, minStartDate }),
        [startDate, endDate, remoteBookings, selectedItems, minStartDate]
    )

    const helperMessage = useMemo(
        () => computeHelperMessage({
            hasScheduleConflict,
            remoteBookings,
            selectedItems,
            startDate,
            autoStartDate,
            minimumDateTime
        }),
        [hasScheduleConflict, remoteBookings, selectedItems, startDate, autoStartDate, minimumDateTime]
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
        minStartDate,
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
        setErrorMessage,
        showToast
    })

    return {
        user,
        selectedItems,
        modalView,
        startDate,
        endDate,
        minStartDate,
        excludeDateIntervals,
        hasStartConflict,
        hasEndConflict,
        hasScheduleConflict,
        purpose,
        isSubmittable,
        isSubmitting,
        errorMessage: errorMessage || (hasScheduleConflict ? conflictMessage : ''),
        helperMessage,
        ...handlers,
        handleSubmit
    }
}
