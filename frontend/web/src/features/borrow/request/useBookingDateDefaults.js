import { useEffect } from 'react'
import { getCurrentBookingDateTimeValue, getNextBookingHourValue } from '@shared/util/date'

export const useBookingDateDefaults = ({
    isOpen,
    modalView,
    minuteTick,
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
        const updateMinuteTick = () => setMinuteTick(Date.now())
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
    }, [isOpen, setMinuteTick])

    useEffect(() => {
        if (!isOpen || modalView !== 'summary') {
            return
        }
        if (!startDateIsAutomaticRef.current && !endDateIsAutomaticRef.current) {
            return
        }
        const currentDateTime = getCurrentBookingDateTimeValue()
        updateSummaryState((prev) => {
            const newState = {}
            const nextStartDate = startDateIsAutomaticRef.current ? currentDateTime : prev.startDate
            if (startDateIsAutomaticRef.current) {
                newState.startDate = nextStartDate
            }
            if (endDateIsAutomaticRef.current) {
                newState.endDate = getNextBookingHourValue(nextStartDate || currentDateTime)
            }
            return newState
        })
    }, [isOpen, minuteTick, modalView, updateSummaryState, startDateIsAutomaticRef, endDateIsAutomaticRef])

    useEffect(() => {
        if (isOpen) {
            const currentDateTime = getCurrentBookingDateTimeValue()

            updateSummaryState((prev) => {
                if (prev.modalView === 'submitted') {
                    return {}
                }
                const newState = { modalView: selectedItemCount > 0 ? 'summary' : 'empty' }
                if (!prev.startDate) {
                    newState.startDate = currentDateTime
                    newState.endDate = getNextBookingHourValue(currentDateTime)
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
                purpose: ''
            })
        }
    }, [isOpen, selectedItemCount, updateSummaryState, startDateIsAutomaticRef, endDateIsAutomaticRef])
}
