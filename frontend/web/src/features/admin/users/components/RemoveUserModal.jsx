import { useCallback } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useDeleteUser } from '@/features/users/api/delete-user'
import { isLocalError } from '@/lib/errors'

const defaultUser = Object.freeze({})
const noop = () => null

export const RemoveUserModal = ({
    isOpen = false,
    onClose = noop,
    user = defaultUser,
    onSuccess = noop,
    onError = noop
}) => {
    const deleteUserMutation = useDeleteUser()

    const handleClose = useCallback(() => {
        onClose()
    }, [onClose])

    const handleConfirm = useCallback(async () => {
        if (!user || !user.id) {
            return
        }
        try {
            await deleteUserMutation.mutateAsync(user.id)
            onSuccess()
            onClose()
        } catch (error) {
            const message = (error && error.message) || 'Failed to remove user'
            if (isLocalError(error)) {
                onError(message)
            }
            onClose()
        }
    }, [deleteUserMutation, onClose, onError, onSuccess, user])

    return (
        <ConfirmModal
            isOpen={isOpen && Boolean(user && user.id)}
            onClose={handleClose}
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
