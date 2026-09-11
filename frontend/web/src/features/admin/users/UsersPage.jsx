import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers } from '@/api/users/get-users'
import { SearchInput } from '@/components/ui/SearchInput'
import { UserTable } from '@/features/admin/users/components/UserTable'
import { AddUserModal } from '@/features/admin/users/components/AddUserModal'
import { EditUserModal } from '@/features/admin/users/components/EditUserModal'
import { RemoveUserModal } from '@/features/admin/users/components/RemoveUserModal'
import { Icon } from '@/components/ui/Icon'
import { matchesUserSearch } from '@shared/util/search'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/ui/useToast'

export const UsersPage = (props) => {
    useDocumentTitle('User Management')
    const { users: propUsers } = props
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const { visible: toastVisible, message: toastMessage, type: toastType, show: showToast } = useToast()

    const { data: hookUsers = [], isLoading } = useUsers()
    const users = propUsers ?? hookUsers

    const handleInvalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ['users'] }), [queryClient])

    const handleUserAdded = useCallback(
        (message) => {
            handleInvalidate()
            showToast(message)
        },
        [handleInvalidate, showToast]
    )

    const handleUserEdited = useCallback(
        (updatedUser) => {
            handleInvalidate()
            const updatedName = [updatedUser?.firstname, updatedUser?.lastname].filter(Boolean).join(' ').trim()
            const selectedName = [selectedUser?.firstname, selectedUser?.lastname].filter(Boolean).join(' ').trim()
            showToast(`User (${updatedName || selectedName || 'User'}) edited successfully!`)
        },
        [handleInvalidate, selectedUser, showToast]
    )

    const handleOpenAddBorrower = useCallback(() => setModal('addBorrower'), [])
    const handleOpenAddAdmin = useCallback(() => setModal('addAdmin'), [])

    const handleOpenEdit = useCallback((user) => {
        setSelectedUser(user)
        setModal('edit')
    }, [])

    const handleOpenRemove = useCallback((user) => {
        setSelectedUser(user)
        setModal('remove')
    }, [])

    const handleCloseModal = useCallback(() => {
        setModal(null)
        setSelectedUser(null)
    }, [])

    const filteredUsers = useMemo(() => users.filter((user) => matchesUserSearch(user, search)), [users, search])

    const isAddBorrower = modal === 'addBorrower'
    const isAddAdmin = modal === 'addAdmin'
    const isEdit = modal === 'edit'
    const isRemove = modal === 'remove'
    const isTableLoading = !propUsers && isLoading

    return (
        <div className="flex flex-col gap-6 font-['Poppins']">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 font-normal">
                        Manage system users, roles, and account access.
                    </p>
                </div>
                <div className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleOpenAddBorrower}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-3 py-2.5 bg-sky-800 rounded-lg text-white text-base font-medium hover:bg-sky-900 cursor-pointer">
                        <Icon name="addUser" className="w-5 h-4" />
                        Add Borrower
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenAddAdmin}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-3 py-2.5 bg-white rounded-lg border border-slate-300 text-text text-base font-medium hover:bg-slate-50 cursor-pointer">
                        <Icon name="addUser" className="w-5 h-4 text-text" />
                        Add Admin
                    </button>
                </div>
            </div>

            <SearchInput value={search} onChange={setSearch} placeholder="Search name..." />

            <UserTable
                users={filteredUsers}
                isLoading={isTableLoading}
                onEdit={handleOpenEdit}
                onRemove={handleOpenRemove}
            />

            {isAddBorrower && (
                <AddUserModal
                    key="addBorrower"
                    isOpen
                    onClose={handleCloseModal}
                    userRole="borrower"
                    onSuccess={handleUserAdded}
                />
            )}
            {isAddAdmin && (
                <AddUserModal
                    key="addAdmin"
                    isOpen
                    onClose={handleCloseModal}
                    userRole="admin"
                    onSuccess={handleUserAdded}
                />
            )}
            {isEdit && (
                <EditUserModal isOpen onClose={handleCloseModal} user={selectedUser} onSuccess={handleUserEdited} />
            )}
            {isRemove && (
                <RemoveUserModal isOpen onClose={handleCloseModal} user={selectedUser} onSuccess={handleInvalidate} />
            )}
            <Toast show={toastVisible} message={toastMessage} type={toastType} />
        </div>
    )
}
