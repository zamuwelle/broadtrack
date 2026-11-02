import { useEffect } from 'react'
import { getCurrentBookingDateTimeValue, getNextBookingHourValue } from '@shared/util/date'

export const useBookingDateDefaults = ({
    isOpen,
    modalView,
    minuteTick,
    minStartDate,
    selectedItemCount,
    updateSummaryState,
    setMinuteTick,
    startDateIsAutomaticRef,
    endDateIsAutomaticRef
}) => {
    useEffect(() => {
        if (!isOpen) {
            return
        }
        const updateMinuteTick = () => {
            const now = Date.now()
            const currentDateTime = getCurrentBookingDateTimeValue(new Date(now))
            const defaultStartDate = minStartDate && minStartDate > currentDateTime ? minStartDate : currentDateTime
            updateSummaryState((prev) => {
                if (prev.modalView !== 'summary') {
                    return {}
                }
                const startDate = startDateIsAutomaticRef.current ? defaultStartDate : prev.startDate
                return {
                    ...(startDateIsAutomaticRef.current ? { startDate } : {}),
                    ...(endDateIsAutomaticRef.current
                        ? {
                              endDate: getNextBookingHourValue(startDate || defaultStartDate)
                          }
                        : {})
                }
            })
            setMinuteTick(now)
        }
        updateMinuteTick()
        let intervalId
        const timeoutId = globalThis.setTimeout(
            () => {
                updateMinuteTick()
                intervalId = globalThis.setInterval(updateMinuteTick, 60_000)
            },
            60_000 - (Date.now() % 60_000)
        )
        return () => {
            globalThis.clearTimeout(timeoutId)
            globalThis.clearInterval(intervalId)
        }
    }, [isOpen, minStartDate, setMinuteTick, updateSummaryState, startDateIsAutomaticRef, endDateIsAutomaticRef])

    useEffect(() => {
        if (!isOpen || modalView !== 'summary') {
            return
        }
        if (!startDateIsAutomaticRef.current && !endDateIsAutomaticRef.current) {
            return
        }
        const currentDateTime = getCurrentBookingDateTimeValue()
        const defaultStartDate = minStartDate && minStartDate > currentDateTime ? minStartDate : currentDateTime
        updateSummaryState((prev) => {
            const newState = {}
            const nextStartDate = startDateIsAutomaticRef.current ? defaultStartDate : prev.startDate
            if (startDateIsAutomaticRef.current) {
                newState.startDate = nextStartDate
            }
            if (endDateIsAutomaticRef.current) {
                newState.endDate = getNextBookingHourValue(nextStartDate || defaultStartDate)
            }
            return newState
        })
    }, [
        isOpen,
        minuteTick,
        modalView,
        minStartDate,
        updateSummaryState,
        startDateIsAutomaticRef,
        endDateIsAutomaticRef
    ])

    useEffect(() => {
        if (isOpen) {
            const currentDateTime = getCurrentBookingDateTimeValue()
            const defaultStartDate = minStartDate && minStartDate > currentDateTime ? minStartDate : currentDateTime

            updateSummaryState((prev) => {
                if (prev.modalView === 'submitted') {
                    return {}
                }
                const newState = {
                    modalView: selectedItemCount > 0 ? 'summary' : 'empty'
                }
                if (!prev.startDate) {
                    newState.startDate = defaultStartDate
                    newState.endDate = getNextBookingHourValue(defaultStartDate)
                }
                return newState
            })
        } else {
            startDateIsAutomaticRef.current = true
            endDateIsAutomaticRef.current = true
            updateSummaryState({
                modalView: selectedItemCount > 0 ? 'summary' : 'empty',
                startDate: '',
                endDate: '',
                purpose: '',
                errorMessage: '',
                requestError: ''
            })
        }
    }, [isOpen, selectedItemCount, minStartDate, updateSummaryState, startDateIsAutomaticRef, endDateIsAutomaticRef])
}
