import { useCallback, useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useDeleteUser } from '@/features/users/api/delete-user'

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
    const [errorMessage, setErrorMessage] = useState('')

    const handleClose = useCallback(() => {
        setErrorMessage('')
        onClose()
    }, [onClose])

    const handleConfirm = useCallback(async () => {
        if (!user || !user.id) {
            return
        }
        setErrorMessage('')
        try {
            await deleteUserMutation.mutateAsync(user.id)
            onSuccess()
            onClose()
        } catch (error) {
            const message = (error && error.message) || 'Failed to remove user'
            setErrorMessage(message)
            onError(message)
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
            variant="danger">
            {errorMessage ? (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5 w-full">
                    {errorMessage}
                </p>
            ) : null}
        </ConfirmModal>
    )
}
