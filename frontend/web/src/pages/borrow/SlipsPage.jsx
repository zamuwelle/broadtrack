import { useCallback } from 'react'
import { useSend } from '@/hooks/actions/useSend'
import { useBookings } from '@/hooks/queries/useBookings'
import { useUser } from '@/hooks/queries/useUser'
import { useSetState } from '@shared/hooks/useSetState'
import { useInvalidateBookings } from '@/hooks/queries/useInvalidateBookings'
import { getBookingStatus } from '@shared/util/booking'
import { bookingService } from '@/api'
import { BookingSlipCard } from '@/components/borrow/slips/BookingSlipCard'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { CancelBookingModal } from '@/components/borrow/slips/CancelBookingModal'
import { EmptyState } from '@/components/ui/EmptyState'

import { bookingFilterOptions } from '@shared/data/bookingStatuses'

const defaultBookings = Object.freeze([])
const defaultEmptyUser = Object.freeze({})

const matchStatusFilter = (booking, selectedStatus) => {
    const status = getBookingStatus(booking)
    if (selectedStatus === 'Approved') {
        return status === 'approved' || status === 'released'
    }
    if (selectedStatus === 'Pending') {
        return status === 'pending'
    }
    if (selectedStatus === 'Cancelled') {
        return status === 'cancelled' || status === 'canceled'
    }
    if (selectedStatus === 'Returned') {
        return status === 'returned'
    }
    if (selectedStatus === 'Rejected') {
        return status === 'rejected'
    }
    return true
}

export const SlipsPage = ({ selectedStatus: propStatus, onSelectStatus: propSetStatus }) => {
    const invalidateBookings = useInvalidateBookings()
    const { data: user = defaultEmptyUser } = useUser()
    const { data: bookings = defaultBookings, isLoading } = useBookings()
    const [pageState, updatePageState] = useSetState({
        internalStatus: 'All Ticket Requests',
        cancellingBookingId: null,
        cancelError: ''
    })
    const { internalStatus, cancellingBookingId } = pageState

    const selectedStatus = propStatus ?? internalStatus

    const handleStatusChange = useCallback(
        (status) => {
            if (propSetStatus) {
                propSetStatus(status)
            } else {
                updatePageState({ internalStatus: status })
            }
        },
        [propSetStatus, updatePageState]
    )

    const cancelSend = useSend({
        send: (bookingId) => bookingService.cancel(bookingId),
        onSuccess: () => {
            invalidateBookings()
            updatePageState({ cancellingBookingId: null, cancelError: '' })
        },
        onError: (error = {}) => {
            console.error('Failed to cancel booking request:', error)
            updatePageState({
                cancellingBookingId: null,
                cancelError: (error && error.message) || 'Failed to cancel booking request'
            })
        }
    })

    const handleOpenCancelModal = useCallback(
        (bookingId) => {
            updatePageState({ cancellingBookingId: bookingId })
        },
        [updatePageState]
    )

    const handleCloseCancelModal = useCallback(() => {
        updatePageState({ cancellingBookingId: null })
    }, [updatePageState])

    const handleConfirmCancel = useCallback(() => {
        if (cancellingBookingId) {
            cancelSend.send(cancellingBookingId)
        }
    }, [cancelSend, cancellingBookingId])

    const filteredBookings = bookings
        .filter((booking) => matchStatusFilter(booking, selectedStatus))
        .toSorted(
            (firstBooking, secondBooking) =>
                new Date(secondBooking.created_at || secondBooking.start_date) -
                new Date(firstBooking.created_at || firstBooking.start_date)
        )

    const emptyDesc =
        selectedStatus === 'All Ticket Requests'
            ? "You haven't made any booking requests yet."
            : `No slips matching the "${selectedStatus}" status.`

    return (
        <div className="flex flex-col gap-6 font-['Poppins']">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Borrower Slips</h1>
                    <p className="text-sm text-slate-500 font-normal">
                        Track your request tickets, approvals, and return records.
                    </p>
                </div>
                <FilterDropdown value={selectedStatus} onChange={handleStatusChange} options={bookingFilterOptions} />
            </div>

            {isLoading && (
                <div className="w-full max-w-[1034px] mx-auto flex flex-wrap items-start justify-start gap-6 lg:gap-8 animate-pulse">
                    {[1, 2].map((placeholderIndex) => (
                        <div
                            key={placeholderIndex}
                            className="w-full max-w-[501px] h-[680px] lg:h-[751px] rounded-lg bg-slate-100 border border-slate-200"
                        />
                    ))}
                </div>
            )}
            {!isLoading && filteredBookings.length > 0 && (
                <div className="w-full max-w-[1034px] mx-auto flex flex-wrap items-start justify-start gap-6 lg:gap-8">
                    {filteredBookings.map((booking) => (
                        <BookingSlipCard
                            key={booking.id}
                            booking={booking}
                            currentUser={user}
                            onCancel={handleOpenCancelModal}
                        />
                    ))}
                </div>
            )}
            {!isLoading && filteredBookings.length === 0 && (
                <EmptyState icon="summary" title="No booking slips found" description={emptyDesc} />
            )}

            <CancelBookingModal
                isOpen={Boolean(cancellingBookingId)}
                onClose={handleCloseCancelModal}
                onConfirm={handleConfirmCancel}
                isPending={cancelSend.isPending}
            />
        </div>
    )
}
