import { useCallback } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useDeleteUser } from '@/features/users/api/delete-user'

const defaultUser = Object.freeze({})
const noop = () => null

export const RemoveUserModal = ({ isOpen = false, onClose = noop, user = defaultUser, onSuccess = noop }) => {
    const deleteUserMutation = useDeleteUser()

    const handleConfirm = useCallback(async () => {
        if (!user || !user.id) {
            return
        }
        try {
            await deleteUserMutation.mutateAsync(user.id)
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Failed to remove user:', error)
        }
    }, [deleteUserMutation, onClose, onSuccess, user])

    return (
        <ConfirmModal
            isOpen={isOpen && Boolean(user && user.id)}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Remove User"
            description="Are you sure you want to remove this user? This process cannot be undone."
            confirmLabel="Remove"
            loadingLabel="Removing..."
            isPending={deleteUserMutation.isPending}
            variant="danger"
        />
    )
}
