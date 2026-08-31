import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'

const noop = () => null

export const UserTablePagination = ({
    activePage = 1,
    totalPages = 1,
    onPrevPage = noop,
    onNextPage = noop,
    onSelectPage = noop
}) => {
    const handlePageClick = useCallback(
        (event) => {
            const { page } = event.currentTarget.dataset
            if (page) {
                onSelectPage(Number(page))
            }
        },
        [onSelectPage]
    )

    const pageNumbers = Array.from({ length: totalPages }, (_, pageIndex) => pageIndex + 1)

    return (
        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden shadow-xs">
            <button
                type="button"
                onClick={onPrevPage}
                disabled={activePage === 1}
                className="h-10 w-10 flex items-center justify-center border-r border-slate-300 text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer">
                <Icon name="paginationArrow" className="rotate-180" />
            </button>
            {pageNumbers.map((pageNumber) => {
                const isActive = pageNumber === activePage
                const colorClass = isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-slate-50'
                return (
                    <button
                        key={pageNumber}
                        type="button"
                        data-page={pageNumber}
                        onClick={handlePageClick}
                        className={`h-10 w-10 flex items-center justify-center text-xs font-normal border-r border-slate-300 last:border-r-0 cursor-pointer ${colorClass}`}>
                        {pageNumber}
                    </button>
                )
            })}
            <button
                type="button"
                onClick={onNextPage}
                disabled={activePage === totalPages}
                className="h-10 w-10 flex items-center justify-center text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer">
                <Icon name="paginationArrow" />
            </button>
        </div>
    )
}
