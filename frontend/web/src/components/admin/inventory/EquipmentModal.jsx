import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { EquipmentModalDialog } from '@/components/admin/inventory/EquipmentModalDialog'

const defaultCategories = Object.freeze([])
const noop = () => null

export const EquipmentModal = ({
    isOpen = false,
    onClose = noop,
    equipment = null,
    categories = defaultCategories,
    onSuccess = noop
}) => {
    useEscapeKey(onClose)

    if (!isOpen) {
        return null
    }

    return (
        <EquipmentModalDialog equipment={equipment} categories={categories} onClose={onClose} onSuccess={onSuccess} />
    )
}
