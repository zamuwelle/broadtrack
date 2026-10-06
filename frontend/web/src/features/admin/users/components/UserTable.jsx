import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { UserTableRow } from '@/features/admin/users/components/UserTableRow'
import { UserTablePagination } from '@/features/admin/users/components/UserTablePagination'

const defaultUsers = Object.freeze([])
const noop = () => null

const rowHeight = 56
const getFooterHeight = (footer) =>
    footer ? footer.offsetHeight + Number(getComputedStyle(footer).marginTop.replace('px', '')) : 0

const renderTableBody = ({ isLoading, users, displayedUsers, startIndex, onEdit, onRemove }) => {
    if (isLoading) {
        return (
            <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-400">
                    Loading...
                </td>
            </tr>
        )
    }

    if (users.length === 0) {
        return (
            <tr>
                <td colSpan={8} className="px-3 py-6 text-center max-sm:text-left text-xs text-slate-400">
                    <span className="max-sm:sticky max-sm:left-3">No users found.</span>
                </td>
            </tr>
        )
    }

    return displayedUsers.map((user, index) => (
        <UserTableRow key={user.id} user={user} index={startIndex + index + 1} onEdit={onEdit} onRemove={onRemove} />
    ))
}

export const UserTable = ({ users = defaultUsers, isLoading = false, onEdit = noop, onRemove = noop }) => {
    const [pageSize, setPageSize] = useState(5)
    const [currentPage, setCurrentPage] = useState(1)
    const tableRef = useRef(null)
    const footerRef = useRef(null)

    useLayoutEffect(() => {
        const table = tableRef.current
        const main = table?.closest('main')
        if (!table || !main) {
            return
        }
        const measure = () => {
            const mainTop = main.getBoundingClientRect().top
            const top = table.getBoundingClientRect().top - mainTop + main.scrollTop
            const header = table.querySelector('thead')?.getBoundingClientRect().height || 0
            const measuredRowHeight =
                (!isLoading && users.length > 0 && table.querySelector('tbody tr')?.getBoundingClientRect().height) ||
                rowHeight
            const scrollContainer = table.querySelector('.overflow-x-auto')
            const scrollbarHeight = scrollContainer ? scrollContainer.offsetHeight - scrollContainer.clientHeight : 0
            const footerHeight = getFooterHeight(footerRef.current)
            const bottomPadding = Number(getComputedStyle(main.firstElementChild).paddingBottom.replace('px', '')) || 0
            const visibleHeight = Math.min(
                main.clientHeight,
                (window.visualViewport?.height || window.innerHeight) - mainTop
            )
            const available = visibleHeight - top - header - footerHeight - bottomPadding - scrollbarHeight - 2
            setPageSize(Math.max(1, Math.floor(available / measuredRowHeight)))
        }
        const observer = new ResizeObserver(measure)
        observer.observe(main)
        observer.observe(main.firstElementChild)
        window.visualViewport?.addEventListener('resize', measure)
        measure()
        return () => {
            observer.disconnect()
            window.visualViewport?.removeEventListener('resize', measure)
        }
    }, [isLoading, users.length, pageSize])

    const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
    const activePage = Math.min(currentPage, totalPages)
    const startIndex = (activePage - 1) * pageSize
    const displayedUsers = users.slice(startIndex, startIndex + pageSize)
    const showingStart = users.length === 0 ? 0 : startIndex + 1
    const showingEnd = Math.min(startIndex + pageSize, users.length)

    const handlePrevPage = useCallback(() => {
        setCurrentPage(Math.max(1, activePage - 1))
    }, [activePage])

    const handleNextPage = useCallback(() => {
        setCurrentPage(Math.min(totalPages, activePage + 1))
    }, [activePage, totalPages])

    const handleSelectPage = useCallback((page) => setCurrentPage(page), [])
    return (
        <div ref={tableRef} className="w-full flex flex-col font-['Poppins']">
            <div className="w-full bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-300">
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-12 text-center">
                                    No.
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-36">
                                    First Name
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-32">
                                    Last Name
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300">
                                    Email
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-32 text-center">
                                    Department
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-28 text-center">
                                    Role
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-56 text-center">
                                    Date Created
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 w-28 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {renderTableBody({
                                isLoading,
                                users,
                                displayedUsers,
                                startIndex,
                                onEdit,
                                onRemove
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isLoading ? null : (
                <div
                    ref={footerRef}
                    className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4">
                    <span className="text-xs text-text font-normal text-center sm:text-left">
                        Showing {showingStart} to {showingEnd} of {users.length} users
                    </span>
                    {users.length > pageSize ? (
                        <UserTablePagination
                            activePage={activePage}
                            totalPages={totalPages}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                            onSelectPage={handleSelectPage}
                        />
                    ) : null}
                </div>
            )}
        </div>
    )
}
