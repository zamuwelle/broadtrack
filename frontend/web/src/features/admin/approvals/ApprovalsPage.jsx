import { useCallback, useMemo } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/ui/CategoryButtons'
import { ApprovalCard } from '@/features/admin/approvals/components/ApprovalCard'
import { DecisionModal } from '@/features/admin/approvals/components/DecisionModal'
import { ConfirmReturnModal } from '@/features/admin/approvals/components/ConfirmReturnModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBookings } from '@/api/bookings/get-bookings'
import { useSetState } from '@shared/hooks/useSetState'
import { flattenBookingsByEquipment, getBookingStatus } from '@shared/util/booking'
import { matchesBookingSearch } from '@shared/util/search'
import { APPROVAL_STATUSES } from '@shared/constants'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

const resolveStatusPriority = (status) => {
    if (status === 'pending') {
        return 1
    }
    if (status === 'approved') {
        return 2
    }
    return 3
}

const INITIAL_PAGE_STATE = Object.freeze({
    searchText: '',
    selectedStatus: 'All',
    approvingBooking: null,
    rejectingBooking: null,
    returningBooking: null
})

const matchStatus = (status, selectedStatus) => {
    if (status === 'cancelled') {
        return false
    }
    if (selectedStatus === 'Pending') {
        return status === 'pending'
    }
    if (selectedStatus === 'Confirmed') {
        return status === 'approved'
    }
    if (selectedStatus === 'Rejected') {
        return status === 'rejected'
    }
    if (selectedStatus === 'Completed') {
        return status === 'returned'
    }
    return true
}

const sortApprovalBookings = (firstBooking, secondBooking) => {
    const diff =
        resolveStatusPriority(getBookingStatus(firstBooking)) - resolveStatusPriority(getBookingStatus(secondBooking))
    return diff === 0
        ? new Date(secondBooking.created_at || secondBooking.start_date).getTime() -
              new Date(firstBooking.created_at || firstBooking.start_date).getTime()
        : diff
}

const filterAndSortBookings = (bookings, selectedStatus, searchText) =>
    bookings
        .filter(
            (booking) =>
                matchStatus(getBookingStatus(booking), selectedStatus) && matchesBookingSearch(booking, searchText)
        )
        .toSorted(sortApprovalBookings)

const useApprovalModals = (updatePageState) => {
    const handleApprove = useCallback(
        (bookingToApprove) => updatePageState({ approvingBooking: bookingToApprove }),
        [updatePageState]
    )
    const handleReject = useCallback(
        (bookingToReject) => updatePageState({ rejectingBooking: bookingToReject }),
        [updatePageState]
    )
    const handleReturn = useCallback(
        (bookingToReturn) => updatePageState({ returningBooking: bookingToReturn }),
        [updatePageState]
    )
    const handleCloseApprove = useCallback(() => updatePageState({ approvingBooking: null }), [updatePageState])
    const handleCloseReject = useCallback(() => updatePageState({ rejectingBooking: null }), [updatePageState])
    const handleCloseReturn = useCallback(() => updatePageState({ returningBooking: null }), [updatePageState])

    return {
        handleApprove,
        handleReject,
        handleReturn,
        handleCloseApprove,
        handleCloseReject,
        handleCloseReturn
    }
}

export const ApprovalsPage = (props) => {
    useDocumentTitle('Booking Approvals')
    const { bookings: propBookings } = props
    const { data: hookBookings = [] } = useBookings()
    const bookings = propBookings ?? hookBookings

    const [pageState, updatePageState] = useSetState(INITIAL_PAGE_STATE)
    const { searchText, selectedStatus, approvingBooking, rejectingBooking, returningBooking } = pageState

    const handleSearchChange = useCallback(
        (newSearchText) => updatePageState({ searchText: newSearchText }),
        [updatePageState]
    )

    const handleStatusSelect = useCallback(
        (newSelectedStatus) => updatePageState({ selectedStatus: newSelectedStatus }),
        [updatePageState]
    )

    const modalHandlers = useApprovalModals(updatePageState)
    const flattenedBookings = useMemo(() => flattenBookingsByEquipment(bookings), [bookings])
    const filteredBookings = useMemo(
        () => filterAndSortBookings(flattenedBookings, selectedStatus, searchText),
        [flattenedBookings, selectedStatus, searchText]
    )

    return (
        <div className="flex flex-col font-['Poppins']">
            <div className="mt-4 sm:mt-6 lg:mt-[42px] flex flex-col gap-4">
                <SearchInput
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search by borrower name, ticket code, or gear..."
                />
                <CategoryButtons options={APPROVAL_STATUSES} selected={selectedStatus} onSelect={handleStatusSelect} />
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col gap-6">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <ApprovalCard
                            key={booking.itemKey ?? booking.id}
                            booking={booking}
                            onApprove={modalHandlers.handleApprove}
                            onReject={modalHandlers.handleReject}
                            onReturn={modalHandlers.handleReturn}
                        />
                    ))
                ) : (
                    <EmptyState
                        title="No matching requests"
                        description="No reservations fit this filter or search string."
                    />
                )}
            </div>

            <DecisionModal
                key={`approve-${approvingBooking?.id ?? 'closed'}`}
                isOpen={Boolean(approvingBooking)}
                onClose={modalHandlers.handleCloseApprove}
                booking={approvingBooking}
                type="approve"
            />
            <DecisionModal
                key={`reject-${rejectingBooking?.id ?? 'closed'}`}
                isOpen={Boolean(rejectingBooking)}
                onClose={modalHandlers.handleCloseReject}
                booking={rejectingBooking}
                type="reject"
            />
            <ConfirmReturnModal
                isOpen={Boolean(returningBooking)}
                onClose={modalHandlers.handleCloseReturn}
                booking={returningBooking}
            />
        </div>
    )
}
