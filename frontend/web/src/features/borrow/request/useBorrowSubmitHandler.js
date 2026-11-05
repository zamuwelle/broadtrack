import { useCallback, useEffect, useRef } from 'react'
import { isLocalError } from '@/lib/errors'

export const useSummarySession = (isOpen) => {
    const session = useRef(0)
    useEffect(() => {
        if (!isOpen) {
            session.current += 1
        }
    }, [isOpen])
    return session
}

export const useBorrowSubmitHandler = ({
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
}) =>
    useCallback(async () => {
        if (!isSubmittable || isSubmitting) {
            return
        }
        setErrorMessage('')
        setRequestError('')
        const session = summarySession.current
        try {
            await createBookingMutation.mutateAsync({
                equipment_ids: selectedItems.map((item) => item.id),
                purpose,
                start_date: startDate,
                end_date: endDate
            })
            if (session === summarySession.current) {
                updateSummaryState({
                    modalView: 'submitted',
                    startDate: '',
                    endDate: '',
                    purpose: ''
                })
            }
            removeSubmittedItems(selectedItems)
        } catch (submitError) {
            const message =
                submitError?.message || 'Failed to submit booking request. Please check dates and try again.'
            if (session === summarySession.current && submitError?.status === 422) {
                setErrorMessage(message)
            }
            if (isLocalError(submitError) && submitError?.status !== 422) {
                showToast(message, 'danger')
            }
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
        removeSubmittedItems,
        setErrorMessage,
        setRequestError,
        summarySession,
        showToast
    ])
