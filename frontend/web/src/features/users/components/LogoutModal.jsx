import { ConfirmModal } from '@/components/ui/ConfirmModal'

const noop = () => null

export const LogoutModal = ({ isOpen = false, onClose = noop, onConfirm = noop }) => (
    <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Logout"
        description="You will be returned to the landing page."
        confirmLabel="Logout"
        variant="danger"
    />
)
