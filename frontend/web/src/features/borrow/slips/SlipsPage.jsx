import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useCancelBooking } from '@/features/bookings/api/cancel-booking'
import { useUser } from '@/lib/auth'
import { useSetState } from '@shared/hooks/useSetState'
import { getBookingStatus } from '@shared/util/booking'
import { BookingSlipCard } from '@/features/borrow/slips/components/BookingSlipCard'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { BOOKING_FILTER_OPTIONS } from '@shared/constants'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'
import { useToast } from '@/hooks/ui/useToast'

const DEFAULT_BOOKINGS = Object.freeze([])
const DEFAULT_EMPTY_USER = Object.freeze({})

const matchStatusFilter = (booking, selectedStatus) => {
    const status = getBookingStatus(booking)
    if (selectedStatus === 'Approved') {
        return status === 'approved'
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

const useSlipModals = (cancelMutation, showToast) => {
    const [pageState, updatePageState] = useSetState({
        cancellingBookingId: null
    })
    const { cancellingBookingId } = pageState

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
            updatePageState({ cancellingBookingId: null })
            showToast('Booking request cancelled.', 'success')
        } catch (error) {
            updatePageState({ cancellingBookingId: null })
            showToast((error && error.message) || 'Failed to cancel booking request.', 'danger')
        }
    }, [cancelMutation, cancellingBookingId, showToast, updatePageState])

    return {
        cancellingBookingId,
        handleOpenCancelModal,
        handleCloseCancelModal,
        handleConfirmCancel
    }
}

export const SlipsPage = ({ selectedStatus: propStatus, onSelectStatus: propSetStatus }) => {
    useDocumentTitle('My Booking Slips')
    const [searchParams, setSearchParams] = useSearchParams()
    const { data: user = DEFAULT_EMPTY_USER } = useUser()
    const { data: bookings = DEFAULT_BOOKINGS, isLoading } = useBookings()
    const cancelMutation = useCancelBooking()
    const urlStatus = searchParams.get('status')
    const selectedStatus =
        propStatus ?? (BOOKING_FILTER_OPTIONS.includes(urlStatus) ? urlStatus : 'All Ticket Requests')

    const { show: showToast } = useToast()
    const { cancellingBookingId, handleOpenCancelModal, handleCloseCancelModal, handleConfirmCancel } = useSlipModals(
        cancelMutation,
        showToast
    )

    const handleDownloadError = useCallback(
        (message) => {
            showToast(message, 'danger')
        },
        [showToast]
    )

    const handleStatusChange = useCallback(
        (status) => {
            if (propSetStatus) {
                propSetStatus(status)
            } else {
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
        [propSetStatus, setSearchParams]
    )

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

    const hasBookings = !isLoading && filteredBookings.length > 0
    const hasNoBookings = !isLoading && filteredBookings.length === 0

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

            {isLoading ? (
                <div className="w-full max-w-[1034px] mx-auto flex flex-wrap items-start justify-start gap-6 lg:gap-8 animate-pulse">
                    {[1, 2].map((placeholderIndex) => (
                        <div
                            key={placeholderIndex}
                            className="w-full max-w-[501px] h-[680px] lg:h-[751px] rounded-lg bg-slate-100 border border-slate-200"
                        />
                    ))}
                </div>
            ) : null}
            {hasBookings ? (
                <div className="w-full max-w-[1034px] mx-auto flex flex-wrap items-start justify-start gap-6 lg:gap-8">
                    {filteredBookings.map((booking) => (
                        <BookingSlipCard
                            key={booking.id}
                            booking={booking}
                            currentUser={user}
                            onCancel={handleOpenCancelModal}
                            onDownloadError={handleDownloadError}
                        />
                    ))}
                </div>
            ) : null}
            {hasNoBookings ? (
                <EmptyState icon="summary" title="No booking slips found" description={emptyDesc} />
            ) : null}

            <ConfirmModal
                isOpen={Boolean(cancellingBookingId)}
                onClose={handleCloseCancelModal}
                onConfirm={handleConfirmCancel}
                isPending={cancelMutation.isPending}
                title="Are you sure you want to cancel this request?"
                description="This process cannot be undone."
                confirmLabel="Cancel Request"
                loadingLabel="Cancelling..."
                cancelLabel="No, keep it"
                variant="danger"
            />
        </div>
    )
}
