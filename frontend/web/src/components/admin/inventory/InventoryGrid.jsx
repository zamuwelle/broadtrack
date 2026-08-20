import { InventoryCard } from '@/components/admin/inventory/InventoryCard'
import { EmptyState } from '@/components/ui/EmptyState'

const gridClassMap = Object.freeze({
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
})

export const InventoryGrid = (props) => {
    const { columns, columnCount, onEdit, onDelete, onUpdateStatus } = props

    const hasItems = columns.some((column) => column.items.length > 0)
    if (!hasItems) {
        return (
            <EmptyState
                title="No matching equipment"
                description="No broadcast gear fits this filter or search string."
            />
        )
    }

    const gridClass = gridClassMap[columnCount] || 'grid-cols-1'

    return (
        <div className={`grid ${gridClass} gap-6 items-start`}>
            {columns.map((column) => (
                <div key={column.id} className="flex flex-col gap-6">
                    {column.items.map((equipment) => (
                        <InventoryCard
                            key={equipment.id}
                            equipment={equipment}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateStatus={onUpdateStatus}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
