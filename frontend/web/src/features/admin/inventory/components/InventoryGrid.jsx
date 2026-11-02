import { InventoryCard } from '@/features/admin/inventory/components/InventoryCard'
import { EmptyState } from '@/components/ui/EmptyState'

const defaultEquipment = Object.freeze([])
const noop = () => null

export const InventoryGrid = ({
    equipment = defaultEquipment,
    onEdit = noop,
    onDelete = noop,
    onUpdateStatus = noop
}) => {
    if (equipment.length === 0) {
        return (
            <EmptyState
                title="No matching equipment"
                description="No broadcast gear fits this filter or search string."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 min-[2200px]:grid-cols-4 gap-6 items-stretch">
            {equipment.map((item) => (
                <InventoryCard
                    key={item.id}
                    equipment={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    )
}
