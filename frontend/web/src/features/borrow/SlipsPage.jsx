import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBookings } from '@/api/bookings/get-bookings'
import { useCancelBooking } from '@/api/bookings/cancel-booking'
import { useUser } from '@/lib/auth'
import { useSetState } from '@shared/hooks/useSetState'
import { getBookingStatus } from '@shared/util/booking'
import { BookingSlipCard } from '@/features/borrow/slips/components/BookingSlipCard'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { CancelBookingModal } from '@/features/borrow/slips/components/CancelBookingModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { BOOKING_FILTER_OPTIONS } from '@shared/constants'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

const DEFAULT_BOOKINGS = Object.freeze([])
const DEFAULT_EMPTY_USER = Object.freeze({})

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
    useDocumentTitle('My Booking Slips')
    const [searchParams, setSearchParams] = useSearchParams()
    const { data: user = DEFAULT_EMPTY_USER } = useUser()
    const { data: bookings = DEFAULT_BOOKINGS, isLoading } = useBookings()
    const cancelMutation = useCancelBooking()
    const urlStatus = searchParams.get('status')
    const initialStatus = BOOKING_FILTER_OPTIONS.includes(urlStatus) ? urlStatus : 'All Ticket Requests'

    const [pageState, updatePageState] = useSetState({
        internalStatus: initialStatus,
        cancellingBookingId: null,
        cancelError: ''
    })
    const { internalStatus, cancellingBookingId } = pageState

    useEffect(() => {
        if (urlStatus && BOOKING_FILTER_OPTIONS.includes(urlStatus)) {
            updatePageState({ internalStatus: urlStatus })
        }
    }, [urlStatus, updatePageState])

    const selectedStatus = propStatus ?? internalStatus

    const handleStatusChange = useCallback(
        (status) => {
            if (propSetStatus) {
                propSetStatus(status)
            } else {
                updatePageState({ internalStatus: status })
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    if (status && status !== 'All Ticket Requests') {
                        next.set('status', status)
                    } else {
                        next.delete('status')
                    }
                    return next
                })
            }
        },
        [propSetStatus, setSearchParams, updatePageState]
    )

    const handleOpenCancelModal = useCallback(
        (bookingId) => {
            updatePageState({ cancellingBookingId: bookingId })
        },
        [updatePageState]
    )

    const handleCloseCancelModal = useCallback(() => {
        updatePageState({ cancellingBookingId: null })
    }, [updatePageState])

    const handleConfirmCancel = useCallback(async () => {
        if (!cancellingBookingId) {
            return
        }
        try {
            await cancelMutation.mutateAsync(cancellingBookingId)
            updatePageState({ cancellingBookingId: null, cancelError: '' })
        } catch (error) {
            console.error('Failed to cancel booking request:', error)
            updatePageState({
                cancellingBookingId: null,
                cancelError: (error && error.message) || 'Failed to cancel booking request'
            })
        }
    }, [cancelMutation, cancellingBookingId, updatePageState])

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
                <FilterDropdown value={selectedStatus} onChange={handleStatusChange} options={BOOKING_FILTER_OPTIONS} />
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
                isPending={cancelMutation.isPending}
            />
        </div>
    )
}
