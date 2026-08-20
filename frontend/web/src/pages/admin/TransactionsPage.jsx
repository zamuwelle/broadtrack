import { useCallback, useMemo } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/borrow/equipment/CategoryButtons'
import { TransactionTable } from '@/components/admin/transactions/TransactionTable'
import { TransactionDetailsModal } from '@/components/admin/transactions/TransactionDetailsModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBookings } from '@/hooks/queries/useBookings'
import { useSetState } from '@shared/hooks/useSetState'
import { getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { transactionCategories } from '@shared/data/transactions'
import { matchesBookingSearch } from '@shared/util/search'

const initialPageState = Object.freeze({
    searchText: '',
    selectedCategory: 'All',
    selectedTransaction: null
})

export const TransactionsPage = (props) => {
    const { bookings: propBookings } = props
    const { data: hookBookings = [] } = useBookings()
    const bookings = propBookings ?? hookBookings

    const [pageState, updatePageState] = useSetState(initialPageState)
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
                    categories={transactionCategories}
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
