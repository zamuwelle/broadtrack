import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { LiveStatusDropdown } from '@/features/admin/inventory/components/LiveStatusDropdown'
import { getOptimizedImageUrl } from '@shared/util/image'

const defaultEquipment = Object.freeze({})
const noop = () => null

const resolveCategoryName = (category) =>
    (typeof category === 'string' ? category : category?.name) || 'Support'

export const InventoryCard = ({
    equipment = defaultEquipment,
    onEdit = noop,
    onDelete = noop,
    onUpdateStatus = noop
}) => {
    const equipmentTitle = equipment.name || 'Equipment'
    const equipmentModel = equipment.model || 'N/A'
    const equipmentDescription = equipment.description || 'No description available'
    const serialNumber = equipment.serial_no || 'N/A'
    const categoryName = resolveCategoryName(equipment.category)

    const handleEdit = useCallback(() => {
        onEdit(equipment)
    }, [equipment, onEdit])

    const handleDelete = useCallback(() => {
        onDelete(equipment)
    }, [equipment, onDelete])

    const handleUpdateStatus = useCallback(
        (newStatus) => {
            onUpdateStatus(equipment.id, newStatus)
        },
        [equipment.id, onUpdateStatus]
    )

    const optimizedImage = equipment.image ? getOptimizedImageUrl(equipment.image, 600, 300) : null

    return (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] flex flex-col h-full font-['Poppins'] relative hover:z-20 focus-within:z-30">
            <div className={`relative h-44 ${optimizedImage ? 'bg-white' : 'bg-slate-100'} border-b border-slate-200 overflow-hidden rounded-t-2xl shrink-0`}>
                {optimizedImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
                        <img
                            src={optimizedImage}
                            alt={equipmentTitle}
                            className="h-full w-full object-contain"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                    </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                        type="button"
                        title="Edit Asset"
                        onClick={handleEdit}
                        className="rounded-[8.5px] hover:bg-primary/30 transition-colors cursor-pointer flex items-center justify-center">
                        <Icon name="editButton" />
                    </button>
                    <button
                        type="button"
                        title="Delete Asset"
                        onClick={handleDelete}
                        className="rounded-[8.5px] hover:bg-danger-hover/30 transition-colors cursor-pointer flex items-center justify-center">
                        <Icon name="deleteButton" />
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between gap-3.5">
                <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">{equipmentTitle}</h3>
                    <p className="text-xs font-normal text-slate-500">{equipmentModel}</p>
                    <p className="text-xs font-normal text-slate-500 leading-relaxed">
                        {equipmentDescription}
                    </p>
                </div>

                <div className="flex flex-col gap-3.5 mt-auto pt-2">
                    <div className="bg-slate-50 rounded-xl border border-slate-300 px-4 py-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                SERIAL NO
                            </span>
                            <span className="text-xs font-bold text-slate-900">{serialNumber}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                CATEGORY
                            </span>
                            <span className="text-xs font-bold text-slate-900 uppercase">{categoryName}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-200" />

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">LIVE STATUS:</span>
                        <LiveStatusDropdown
                            currentStatus={equipment.status || 'available'}
                            onSelectStatus={handleUpdateStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
