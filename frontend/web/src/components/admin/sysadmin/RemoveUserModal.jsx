import { useCallback } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useSend } from '@/hooks/actions/useSend'
import { userService } from '@/api'

const defaultUser = Object.freeze({})
const noop = () => null

export const RemoveUserModal = ({ isOpen = false, onClose = noop, user = defaultUser, onSuccess = noop }) => {
    const handleSend = useCallback(() => {
        if (user && user.id) {
            return userService.remove(user.id)
        }
        return Promise.resolve()
    }, [user])

    const handleSuccess = useCallback(() => {
        onSuccess()
        onClose()
    }, [onClose, onSuccess])

    const removeUserSend = useSend({
        send: handleSend,
        onSuccess: handleSuccess
    })

    const handleConfirm = useCallback(() => {
        removeUserSend.send()
    }, [removeUserSend])

    return (
        <ConfirmModal
            isOpen={isOpen && Boolean(user && user.id)}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Remove User"
            description="Are you sure you want to remove this user? This process cannot be undone."
            confirmLabel="Remove"
            loadingLabel="Removing..."
            isPending={removeUserSend.isPending}
            variant="danger"
        />
    )
}
