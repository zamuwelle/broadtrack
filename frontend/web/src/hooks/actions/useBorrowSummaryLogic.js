import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTodayDateString } from '@shared/util/date'
import { getBookingStatus } from '@shared/util/booking'
import { useUser } from '@/lib/auth'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { useBookings } from '@/api/bookings/get-bookings'
import { useCreateBooking } from '@/api/bookings/create-booking'
import { useSetState } from '@shared/hooks/useSetState'

const filterParams = Object.freeze({ all: 1, public: 1 })

const isExcludedStatus = (status) =>
    status === 'cancelled' || status === 'canceled' || status === 'rejected' || status === 'returned'

const checkEquipmentMatch = (bookingEquipments, selectedId) => {
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
        if (checkEquipmentMatch(booking.equipments, selected.id)) {
            return true
        }
    }
    return false
}

const findLatestDate = (dateList) => {
    let latest = null
    for (const dateString of dateList) {
        if (!latest || dateString > latest) {
            latest = dateString
        }
    }
    return latest
}

const computeMinStartDate = (remoteBookings, selectedItems, todayDateString) => {
    const activeItemEndDates = []
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        const startDatePrefix = booking.start_date ? String(booking.start_date).slice(0, 10) : ''
        const isOngoing = !isExcludedStatus(status) && startDatePrefix <= todayDateString
        if (isOngoing && hasEquipmentOverlap(booking, selectedItems) && booking.end_date) {
            activeItemEndDates.push(booking.end_date)
        }
    }

    const latestActiveEndDate = findLatestDate(activeItemEndDates)
    if (latestActiveEndDate && latestActiveEndDate > `${todayDateString}T00:00`) {
        if (latestActiveEndDate.includes('T')) {
            return latestActiveEndDate.slice(0, 16)
        }
        return `${latestActiveEndDate.slice(0, 10)}T00:00`
    }
    return `${todayDateString}T00:00`
}

const computeExcludeDateIntervals = (remoteBookings, selectedItems) => {
    const intervals = []
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        if (
            !isExcludedStatus(status) &&
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

const checkScheduleConflict = (startDate, endDate, remoteBookings, selectedItems) => {
    if (!startDate || !endDate) {
        return false
    }
    for (const booking of remoteBookings) {
        const status = getBookingStatus(booking)
        if (!isExcludedStatus(status) && hasEquipmentOverlap(booking, selectedItems)) {
            const bookingStart = booking.start_date ? String(booking.start_date).slice(0, 16) : ''
            const bookingEnd = booking.end_date ? String(booking.end_date).slice(0, 16) : ''
            if (bookingStart < endDate && startDate < bookingEnd) {
                return true
            }
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

const enforceSchoolHours = (dateString) => {
    if (!dateString) {
        return dateString
    }
    const [datePart, timePart] = dateString.split('T')
    if (!timePart) {
        return dateString
    }
    if (timePart < '05:00') {
        return `${datePart}T05:00`
    }
    if (timePart > '20:00') {
        return `${datePart}T20:00`
    }
    return dateString
}

const addMinutesToIso = (isoStr, minutesToAdd) => {
    if (!isoStr) {
        return isoStr
    }
    const [datePart, timePart] = isoStr.split('T')
    if (!datePart || !timePart) {
        return isoStr
    }
    const [yyyy, mm, dd] = datePart.split('-')
    const [hours, mins] = timePart.split(':')
    const date = new Date(yyyy, mm - 1, dd, hours, mins)
    date.setMinutes(date.getMinutes() + minutesToAdd)

    const nyyyy = date.getFullYear()
    const nmm = String(date.getMonth() + 1).padStart(2, '0')
    const ndd = String(date.getDate()).padStart(2, '0')
    const nh = String(date.getHours()).padStart(2, '0')
    const nm = String(date.getMinutes()).padStart(2, '0')
    return `${nyyyy}-${nmm}-${ndd}T${nh}:${nm}`
}

const useBorrowFieldHandlers = ({
    updateSummaryState,
    removeItem,
    selectedItems,
    summaryState,
    remoteBookings,
    setErrorMessage
}) => {
    const handleStartDateChange = useCallback(
        (event) => {
            let selectedDate = event?.target?.value ?? event
            selectedDate &&= enforceSchoolHours(selectedDate)

            let newEndDate = summaryState.endDate
            if (summaryState.endDate && selectedDate >= summaryState.endDate) {
                newEndDate = enforceSchoolHours(addMinutesToIso(selectedDate, 60))
            }

            if (checkScheduleConflict(selectedDate, newEndDate, remoteBookings, selectedItems)) {
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
        [updateSummaryState, summaryState.endDate, remoteBookings, selectedItems, setErrorMessage]
    )

    const handleEndDateChange = useCallback(
        (event) => {
            let selectedDate = event?.target?.value ?? event
            selectedDate &&= enforceSchoolHours(selectedDate)

            let newStartDate = summaryState.startDate
            if (summaryState.startDate && selectedDate <= summaryState.startDate) {
                newStartDate = enforceSchoolHours(addMinutesToIso(selectedDate, -60))
            }

            if (checkScheduleConflict(newStartDate, selectedDate, remoteBookings, selectedItems)) {
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
        [updateSummaryState, summaryState.startDate, remoteBookings, selectedItems, setErrorMessage]
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

    const handleOpenEdit = useCallback(() => {
        updateSummaryState({ modalView: 'edit' })
    }, [updateSummaryState])

    const handleCloseEdit = useCallback(() => {
        updateSummaryState({ modalView: 'summary' })
    }, [updateSummaryState])

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
        handleOpenEdit,
        handleCloseEdit,
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

    const [summaryState, updateSummaryState] = useSetState({
        ...initialSummaryState,
        modalView: selectedItems.length > 0 ? 'summary' : 'empty'
    })
    const { modalView, startDate, endDate, purpose, isSubmitting } = summaryState

    const todayDateString = getTodayDateString()
    const minStartDate = useMemo(
        () => computeMinStartDate(remoteBookings, selectedItems, todayDateString),
        [remoteBookings, selectedItems, todayDateString]
    )

    const excludeDateIntervals = useMemo(
        () => computeExcludeDateIntervals(remoteBookings, selectedItems),
        [remoteBookings, selectedItems]
    )

    const hasScheduleConflict = useMemo(
        () => checkScheduleConflict(startDate, endDate, remoteBookings, selectedItems),
        [startDate, endDate, remoteBookings, selectedItems]
    )

    useEffect(() => {
        if (isOpen) {
            const offset = new Date().getTimezoneOffset()
            const adjusted = new Date(Date.now() - offset * 60 * 1000)
            const localIsoStr = adjusted.toISOString().slice(0, 16)

            updateSummaryState((prev) => {
                if (prev.modalView === 'submitted') {
                    return {}
                }
                const newState = { modalView: selectedItems.length > 0 ? 'summary' : 'empty' }
                if (!prev.startDate) {
                    newState.startDate = enforceSchoolHours(localIsoStr)
                    newState.endDate = enforceSchoolHours(addMinutesToIso(localIsoStr, 60))
                }
                return newState
            })
        } else {
            updateSummaryState({
                modalView: selectedItems.length > 0 ? 'summary' : 'empty',
                startDate: '',
                endDate: '',
                purpose: ''
            })
        }
    }, [isOpen, selectedItems.length, updateSummaryState])

    const isDateRangeValid = !startDate || !endDate || startDate < endDate
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
        setErrorMessage
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
