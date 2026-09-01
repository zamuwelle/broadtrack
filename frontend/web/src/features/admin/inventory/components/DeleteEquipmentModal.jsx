import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useSetState } from '@shared/hooks/useSetState'
import { deleteEquipment } from '@/api/equipment/delete-equipment'

const noop = () => null

const modalIcon = (
    <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <Icon name="danger" className="size-6 text-orange-600" />
    </div>
)

export const DeleteEquipmentModal = ({ isOpen = false, onClose = noop, equipment = null, onSuccess = noop }) => {
    const [modalState, updateModalState] = useSetState({
        isDeleting: false,
        errorMessage: ''
    })
    const { isDeleting, errorMessage } = modalState

    const handleDelete = useCallback(async () => {
        if (!equipment || !equipment.id) {
            return
        }
        updateModalState({ isDeleting: true, errorMessage: '' })
        try {
            await deleteEquipment(equipment.id)
            onSuccess()
            onClose()
        } catch (error) {
            updateModalState({
                errorMessage: (error && error.message) || 'Failed to delete equipment asset'
            })
        } finally {
            updateModalState({ isDeleting: false })
        }
    }, [equipment, onClose, onSuccess, updateModalState])

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
            isPending={isDeleting}
            variant="danger"
            maxWidth="max-w-[538px]">
            {errorMessage && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5 w-full">
                    {errorMessage}
                </p>
            )}
        </ConfirmModal>
    )
}
