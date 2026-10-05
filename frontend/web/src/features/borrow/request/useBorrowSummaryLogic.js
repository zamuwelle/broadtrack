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
import { bookingPurposeSchema } from '@shared/schemas/booking'
import { useToast } from '@/hooks/ui/useToast'
import { useUser } from '@/lib/auth'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useCreateBooking } from '@/features/bookings/api/create-booking'
import {
    checkDateConflictBreakdown,
    hasEquipmentOverlap,
    isBookedStatus
} from '@/features/borrow/request/bookingConflicts'
import { useBookingDateDefaults } from '@/features/borrow/request/useBookingDateDefaults'
import { useBorrowSubmitHandler, useSummarySession } from '@/features/borrow/request/useBorrowSubmitHandler'
import { useSetState } from '@shared/hooks/useSetState'

const filterParams = Object.freeze({ view: 'calendar' })
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
        .filter(
            (item) =>
                isBookedStatus(getBookingStatus(item)) &&
                hasEquipmentOverlap(item, selectedItems) &&
                item.start_date &&
                item.end_date
        )
        .map((item) => ({ start: new Date(item.start_date), end: new Date(item.end_date) }))

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
    errorMessage: '',
    requestError: ''
})

const useBorrowErrorSetters = (updateSummaryState) => ({
    setErrorMessage: useCallback((errorMessage) => updateSummaryState({ errorMessage }), [updateSummaryState]),
    setRequestError: useCallback((requestError) => updateSummaryState({ requestError }), [updateSummaryState])
})

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
            updateSummaryState,
            summaryState.endDate,
            remoteBookings,
            selectedItems,
            setErrorMessage,
            minStartDate,
            startDateIsAutomaticRef,
            endDateIsAutomaticRef
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
            updateSummaryState,
            summaryState.startDate,
            remoteBookings,
            selectedItems,
            setErrorMessage,
            minStartDate,
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

    return { handleStartDateChange, handleEndDateChange, handleRemoveItem, handlePurposeChange }
}

export const useBorrowSummaryLogic = ({ isOpen, propUser }) => {
    const { show: showToast } = useToast()
    const { data: activeUser } = useUser()
    const user = activeUser ?? propUser
    const selectedItems = useBookingCartStore((state) => state.items)
    const removeItem = useBookingCartStore((state) => state.removeItem)
    const removeSubmittedItems = useBookingCartStore((state) => state.removeSubmittedItems)
    const { data: remoteBookings = [] } = useBookings({ params: filterParams })
    const createBookingMutation = useCreateBooking()
    const isSubmitting = createBookingMutation.isPending
    const [minuteTick, setMinuteTick] = useState(Date.now)
    const startDateIsAutomaticRef = useRef(true)
    const endDateIsAutomaticRef = useRef(true)
    const summarySession = useSummarySession(isOpen)

    const [summaryState, updateSummaryState] = useSetState({
        ...initialSummaryState,
        modalView: selectedItems.length > 0 ? 'summary' : 'empty'
    })
    const { modalView, startDate, endDate, purpose, errorMessage, requestError } = summaryState

    const { setErrorMessage, setRequestError } = useBorrowErrorSetters(updateSummaryState)

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

    const { hasStartConflict, hasEndConflict, hasScheduleConflict, conflictMessage, conflictMessages } = useMemo(
        () => checkDateConflictBreakdown({ startDate, endDate, remoteBookings, selectedItems, minStartDate }),
        [startDate, endDate, remoteBookings, selectedItems, minStartDate]
    )

    const helperMessage = useMemo(
        () =>
            computeHelperMessage({
                hasScheduleConflict,
                remoteBookings,
                selectedItems,
                startDate,
                autoStartDate,
                minimumDateTime
            }),
        [hasScheduleConflict, remoteBookings, selectedItems, startDate, autoStartDate, minimumDateTime]
    )

    const isSubmittable = Boolean(
        !isSubmitting &&
        startDate &&
        endDate &&
        startDate >= minStartDate &&
        startDate < endDate &&
        !hasScheduleConflict &&
        bookingPurposeSchema.safeParse(purpose).success &&
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

    const handleOpenEdit = useCallback(() => updateSummaryState({ modalView: 'edit' }), [updateSummaryState])
    const handleCloseEdit = useCallback(() => updateSummaryState({ modalView: 'summary' }), [updateSummaryState])

    const handleSubmit = useBorrowSubmitHandler({
        createBookingMutation,
        isSubmittable,
        isSubmitting,
        selectedItems,
        purpose,
        startDate,
        endDate,
        updateSummaryState,
        removeSubmittedItems,
        setErrorMessage,
        setRequestError,
        summarySession,
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
        conflictMessages,
        purpose,
        isSubmittable,
        isSubmitting,
        errorMessage: errorMessage || (hasScheduleConflict ? conflictMessage : ''),
        requestError,
        helperMessage,
        ...handlers,
        handleOpenEdit,
        handleCloseEdit,
        handleSubmit
    }
}
