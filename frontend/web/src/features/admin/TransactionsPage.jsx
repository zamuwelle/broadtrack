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
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

const INITIAL_PAGE_STATE = Object.freeze({
    searchText: '',
    selectedCategory: 'All',
    selectedTransaction: null
})

const flattenBookingsByEquipment = (bookings) =>
    bookings.flatMap((booking) => {
        const equipments = booking.equipments || []
        if (equipments.length <= 1) {
            return [booking]
        }
        return equipments.map((equipment) =>
            Object.assign({}, booking, {
                itemKey: `${booking.id}-${equipment.id}`,
                equipment,
                equipments: [equipment]
            })
        )
    })

const matchesTransactionCategory = (status, isOverdue, selectedCategory) => {
    if (status === 'pending') {
        return false
    }
    if (selectedCategory === 'Active') {
        return !isOverdue && (status === 'approved' || status === 'released')
    }
    if (selectedCategory === 'Completed') {
        return status === 'returned'
    }
    if (selectedCategory === 'Overdue') {
        return isOverdue
    }
    if (selectedCategory === 'Cancelled') {
        return status === 'cancelled' || status === 'rejected'
    }
    return true
}

export const TransactionsPage = (props) => {
    useDocumentTitle('Transaction History')
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

    const flattenedTransactions = useMemo(() => flattenBookingsByEquipment(bookings), [bookings])

    const filteredTransactions = useMemo(
        () =>
            flattenedTransactions
                .filter((booking) => {
                    const status = getBookingStatus(booking)
                    const isOverdue = isBookingOverdue(booking)
                    return (
                        matchesTransactionCategory(status, isOverdue, selectedCategory) &&
                        matchesBookingSearch(booking, searchText)
                    )
                })
                .toSorted(
                    (firstBooking, secondBooking) =>
                        new Date(secondBooking.start_date || secondBooking.created_at).getTime() -
                        new Date(firstBooking.start_date || firstBooking.created_at).getTime()
                ),
        [flattenedTransactions, searchText, selectedCategory]
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
