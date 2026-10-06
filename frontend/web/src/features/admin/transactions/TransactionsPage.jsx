import { useCallback, useMemo, useState } from 'react'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/ui/CategoryButtons'
import { TransactionTable } from '@/features/admin/transactions/components/TransactionTable'
import { TransactionDetailsModal } from '@/features/admin/transactions/components/TransactionDetailsModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { exportTransactionsCsv, exportTransactionsPdf } from '@/features/bookings/api/export-transactions'
import { useSetState } from '@shared/hooks/useSetState'
import { flattenBookingsByEquipment, getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { matchesBookingSearch } from '@shared/util/search'
import { TRANSACTION_CATEGORIES } from '@shared/constants'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'
import { useToast } from '@/hooks/ui/useToast'

const INITIAL_PAGE_STATE = Object.freeze({
    searchText: '',
    selectedCategory: 'All',
    selectedTransaction: null
})

const matchesTransactionCategory = (status, isOverdue, selectedCategory) => {
    if (status === 'pending') {
        return false
    }
    if (selectedCategory === 'Active') {
        return !isOverdue && status === 'approved'
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

const useTransactionExports = ({ selectedCategory, searchText, showToast }) => {
    const [exportingType, setExportingType] = useState(null)
    const isExporting = Boolean(exportingType)

    const handleExportPdf = useCallback(async () => {
        if (exportingType) {
            return
        }
        try {
            setExportingType('pdf')
            await exportTransactionsPdf({
                category: selectedCategory,
                search: searchText
            })
        } catch (error) {
            showToast((error && error.message) || 'Failed to export transactions to PDF.', 'danger')
        } finally {
            setExportingType(null)
        }
    }, [exportingType, selectedCategory, searchText, showToast])

    const handleExportCsv = useCallback(async () => {
        if (exportingType) {
            return
        }
        try {
            setExportingType('csv')
            await exportTransactionsCsv({
                category: selectedCategory,
                search: searchText
            })
        } catch (error) {
            showToast((error && error.message) || 'Failed to export transactions to CSV.', 'danger')
        } finally {
            setExportingType(null)
        }
    }, [exportingType, selectedCategory, searchText, showToast])

    return { exportingType, isExporting, handleExportPdf, handleExportCsv }
}

export const TransactionsPage = (props) => {
    useDocumentTitle('Transaction History')
    const { bookings: propBookings } = props
    const { data: hookBookings = [] } = useBookings()
    const bookings = propBookings ?? hookBookings

    const [pageState, updatePageState] = useSetState(INITIAL_PAGE_STATE)
    const { searchText, selectedCategory, selectedTransaction } = pageState
    const { show: showToast } = useToast()

    const { exportingType, isExporting, handleExportPdf, handleExportCsv } = useTransactionExports({
        selectedCategory,
        searchText,
        showToast
    })

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
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <CategoryButtons
                        categories={TRANSACTION_CATEGORIES}
                        selected={selectedCategory}
                        onSelect={handleCategorySelect}
                    />
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={isExporting}
                            className="flex-1 min-w-0 sm:flex-none sm:w-48 h-9 px-3 sm:pl-6 sm:pr-5 py-2 bg-sky-800 rounded-xl inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-sky-700 transition-colors sm:shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
                            <div className="justify-start text-white text-sm sm:text-lg font-semibold font-['Poppins']">
                                {exportingType === 'pdf' ? 'Exporting...' : 'Export to PDF'}
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            disabled={isExporting}
                            className="flex-1 min-w-0 sm:flex-none sm:w-48 h-9 px-3 sm:pl-6 sm:pr-5 py-2 bg-sky-800 rounded-xl inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-sky-700 transition-colors sm:shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
                            <div className="justify-start text-white text-sm sm:text-lg font-semibold font-['Poppins']">
                                {exportingType === 'csv' ? 'Exporting...' : 'Export to CSV'}
                            </div>
                        </button>
                    </div>
                </div>
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

            <TransactionDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                booking={selectedTransaction}
                bookings={bookings}
            />
        </div>
    )
}
