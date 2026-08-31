import { useCallback, useEffect, useState } from 'react'
import { UserTableRow } from '@/features/admin/users/components/UserTableRow'
import { UserTablePagination } from '@/features/admin/users/components/UserTablePagination'

const defaultUsers = Object.freeze([])
const noop = () => null

const rowHeight = 56
const fixedOffset = 500

const getDynamicPageSize = () => {
    if (!globalThis.window) {
        return 5
    }
    return Math.max(5, Math.floor((globalThis.window.innerHeight - fixedOffset) / rowHeight))
}

const renderTableBody = ({ isLoading, users, displayedUsers, startIndex, onEdit, onRemove }) => {
    if (isLoading) {
        return (
            <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-400">
                    Loading...
                </td>
            </tr>
        )
    }

    if (users.length === 0) {
        return (
            <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-400">
                    No users found.
                </td>
            </tr>
        )
    }

    return displayedUsers.map((user, index) => (
        <UserTableRow key={user.id} user={user} index={startIndex + index + 1} onEdit={onEdit} onRemove={onRemove} />
    ))
}

export const UserTable = ({ users = defaultUsers, isLoading = false, onEdit = noop, onRemove = noop }) => {
    const [pageSize, setPageSize] = useState(getDynamicPageSize)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const handleResize = () => setPageSize(getDynamicPageSize())
        globalThis.window.addEventListener('resize', handleResize)
        return () => globalThis.window.removeEventListener('resize', handleResize)
    }, [])

    const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
    const activePage = Math.min(currentPage, totalPages)
    const startIndex = (activePage - 1) * pageSize
    const displayedUsers = users.slice(startIndex, startIndex + pageSize)
    const showingStart = users.length === 0 ? 0 : startIndex + 1
    const showingEnd = Math.min(startIndex + pageSize, users.length)

    const handlePrevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1))
    }, [])

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    }, [totalPages])

    const handleSelectPage = useCallback((page) => {
        setCurrentPage(page)
    }, [])

    return (
        <div className="w-full flex flex-col font-['Poppins']">
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
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-28">
                                    Role
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-300 w-56">
                                    Date Created
                                </th>
                                <th className="px-3 py-2.5 text-xs font-semibold text-slate-900 w-28">Action</th>
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

            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4">
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
        </div>
    )
}
