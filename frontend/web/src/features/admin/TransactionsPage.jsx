import { useCallback, useMemo } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/ui/CategoryButtons'
import { TransactionTable } from '@/features/admin/transactions/components/TransactionTable'
import { TransactionDetailsModal } from '@/features/admin/transactions/components/TransactionDetailsModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBookings } from '@/api/bookings/get-bookings'
import { useSetState } from '@shared/hooks/useSetState'
import { getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { matchesBookingSearch } from '@shared/util/search'
import { TRANSACTION_CATEGORIES } from '@shared/constants'

const INITIAL_PAGE_STATE = Object.freeze({
    searchText: '',
    selectedCategory: 'All',
    selectedTransaction: null
})

export const TransactionsPage = (props) => {
    const { bookings: propBookings } = props
    const { data: hookBookings = [] } = useBookings()
    const bookings = propBookings ?? hookBookings

    const [pageState, updatePageState] = useSetState(INITIAL_PAGE_STATE)
    const { searchText, selectedCategory, selectedTransaction } = pageState

    const handleSearchChange = useCallback(
        (newSearchText) => updatePageState({ searchText: newSearchText }),
        [updatePageState]
    )

    const handleCategorySelect = useCallback(
        (newCategory) => updatePageState({ selectedCategory: newCategory }),
        [updatePageState]
    )

    const handleViewDetails = useCallback(
        (transaction) => updatePageState({ selectedTransaction: transaction }),
        [updatePageState]
    )

    const handleCloseModal = useCallback(() => updatePageState({ selectedTransaction: null }), [updatePageState])

    const filteredTransactions = useMemo(
        () =>
            bookings
                .filter((booking) => {
                    const status = getBookingStatus(booking)
                    const isOverdue = isBookingOverdue(booking)

                    if (status === 'pending') {
                        return false
                    }

                    if (selectedCategory === 'Active' && (!['approved', 'released'].includes(status) || isOverdue)) {
                        return false
                    }
                    if (selectedCategory === 'Completed' && status !== 'returned') {
                        return false
                    }
                    if (selectedCategory === 'Overdue' && !isOverdue) {
                        return false
                    }
                    if (selectedCategory === 'Cancelled' && status !== 'cancelled' && status !== 'rejected') {
                        return false
                    }

                    return matchesBookingSearch(booking, searchText)
                })
                .toSorted(
                    (firstBooking, secondBooking) =>
                        new Date(secondBooking.start_date || secondBooking.created_at).getTime() -
                        new Date(firstBooking.start_date || firstBooking.created_at).getTime()
                ),
        [bookings, searchText, selectedCategory]
    )

    const isModalOpen = Boolean(selectedTransaction)

    return (
        <div className="flex flex-col font-['Poppins']">
            <div className="mt-4 sm:mt-6 lg:mt-[42px] flex flex-col gap-4">
                <SearchInput
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search borrower, equipment, or transaction ID..."
                />
                <CategoryButtons
                    categories={TRANSACTION_CATEGORIES}
                    selected={selectedCategory}
                    onSelect={handleCategorySelect}
                />
            </div>

            <div className="mt-4 sm:mt-6 lg:mt-[27px] flex flex-col gap-4">
                {filteredTransactions.length > 0 ? (
                    <TransactionTable transactions={filteredTransactions} onViewDetails={handleViewDetails} />
                ) : (
                    <EmptyState
                        title="No transactions yet"
                        description="Equipment borrowing transactions will appear here once a request is processed."
                    />
                )}
            </div>

            <TransactionDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} booking={selectedTransaction} />
        </div>
    )
}

export const Transactions = TransactionsPage
