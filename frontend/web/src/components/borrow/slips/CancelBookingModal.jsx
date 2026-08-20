import { ConfirmModal } from '@/components/ui/ConfirmModal'

const noop = () => null

export const CancelBookingModal = ({ isOpen = false, onClose = noop, onConfirm = noop, isPending = false }) => (
    <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Are you sure you want to cancel this request?"
        description="This process cannot be undone."
        confirmLabel="Cancel Request"
        loadingLabel="Cancelling..."
        cancelLabel="No, keep it"
        isPending={isPending}
        variant="danger"
    />
)
