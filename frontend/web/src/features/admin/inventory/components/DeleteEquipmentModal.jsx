import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useDeleteEquipment } from '@/features/equipment/api/delete-equipment'
import { isLocalError } from '@/lib/errors'

const noop = () => null

const modalIcon = (
    <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <Icon name="danger" className="size-6 text-orange-600" />
    </div>
)

export const DeleteEquipmentModal = ({
    isOpen = false,
    onClose = noop,
    equipment = null,
    onSuccess = noop,
    onError = noop
}) => {
    const deleteMutation = useDeleteEquipment()
    const handleDelete = useCallback(async () => {
        if (!equipment || !equipment.id) {
            return
        }
        try {
            await deleteMutation.mutateAsync(equipment.id)
            onSuccess()
            onClose()
        } catch (error) {
            const message = (error && error.message) || 'Failed to delete equipment asset'
            if (isLocalError(error)) {
                onError(message)
            }
        }
    }, [deleteMutation, equipment, onClose, onError, onSuccess])

    if (!isOpen || !equipment) {
        return null
    }

    const equipmentTitle = equipment.name || 'Equipment'
    const serialNumber = equipment.serial_no || 'N/A'

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            icon={modalIcon}
            title="Are you sure you want to delete this equipment?"
            description={`${equipmentTitle} • ${serialNumber}`}
            confirmLabel="Delete"
            loadingLabel="Deleting..."
            isPending={deleteMutation.isPending}
            variant="danger"
            maxWidth="max-w-[538px]"
        />
    )
}
