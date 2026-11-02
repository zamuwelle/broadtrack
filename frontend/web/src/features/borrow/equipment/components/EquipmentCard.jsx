import { useCallback, useState } from 'react'
import { cn } from 'cn'
import { StatusBadge } from '@/features/borrow/equipment/components/StatusBadge'
import { SelectButton } from '@/features/borrow/equipment/components/SelectButton'
import { EquipmentExpandedCard } from '@/features/borrow/equipment/components/EquipmentExpandedCard'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { Icon } from '@/components/ui/Icon'
import { getOptimizedImageUrl } from '@shared/util/image'

const defaultEquipment = Object.freeze({})

export const EquipmentCard = ({ equipment = defaultEquipment }) => {
    const [expanded, setExpanded] = useState(false)
    const isSelected = useBookingCartStore((state) => state.items.some((item) => item.id === equipment.id))
    const toggleItem = useBookingCartStore((state) => state.toggleItem)

    const modelName = [equipment.brand, equipment.model].filter(Boolean).join(' ')
    const currentStatus = equipment.status || 'available'
    const isSelectable = currentStatus === 'available' || currentStatus === 'booked'
    const categoryName =
        (typeof equipment.category === 'string' ? equipment.category : equipment.category?.name) || 'Support'

    const handleToggleSelect = useCallback(() => {
        toggleItem(equipment)
    }, [toggleItem, equipment])

    const handleExpand = useCallback(() => {
        setExpanded(true)
    }, [])

    const handleCollapse = useCallback(() => {
        setExpanded(false)
    }, [])

    if (expanded) {
        return (
            <EquipmentExpandedCard
                equipment={equipment}
                modelName={modelName}
                categoryName={categoryName}
                isSelectable={isSelectable}
                isSelected={isSelected}
                onToggleSelect={handleToggleSelect}
                onCollapse={handleCollapse}
            />
        )
    }

    return (
        <div className="h-[371px] w-full overflow-hidden rounded-[8px] border border-border-subtle bg-surface shadow-[0px_4px_4px_rgba(0,0,0,0.05)]">
            <div
                className={cn(
                    'relative flex h-[150px] items-start justify-end gap-[14px] border-b border-border-subtle pr-[21px] pt-[22px]',
                    {
                        'bg-white': Boolean(equipment.image),
                        'bg-slate-100': !equipment.image
                    }
                )}>
                {equipment.image ? (
                    <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
                        <img
                            src={getOptimizedImageUrl(equipment.image, 600, 300)}
                            alt={equipment.name}
                            className="h-full w-full object-contain"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                    </div>
                ) : null}
                <StatusBadge status={equipment.status} className="relative z-10" />
                {isSelectable ? (
                    <SelectButton selected={isSelected} onSelect={handleToggleSelect} className="relative z-10" />
                ) : null}
            </div>
            <div className="flex h-[221px] flex-col justify-between px-4 py-5 lg:px-[26px] lg:py-[28px]">
                <div className="flex flex-col gap-[8px]">
                    <p className="line-clamp-1 text-[18.17px] font-semibold" title={equipment.name}>
                        {equipment.name}
                    </p>
                    <p className="line-clamp-1 min-h-[18px] text-[12px] text-icon-gray" title={modelName}>
                        {modelName}
                    </p>
                    <p
                        className="line-clamp-2 min-h-[33px] text-[12px] leading-snug text-icon-gray"
                        title={equipment.description}>
                        {equipment.description}
                    </p>
                </div>
                <div className="mt-auto flex flex-col gap-[18px]">
                    <div className="h-0 border-t border-border-divider" />
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center justify-center rounded-[12px] border-[0.5px] border-icon-subtle bg-surface px-[8px] py-[4px] text-[12px]">
                            {categoryName}
                        </span>
                        <button
                            type="button"
                            onClick={handleExpand}
                            className="group flex cursor-pointer items-center gap-[2px] rounded-[8px] border-[0.5px] border-border-subtle bg-surface px-[12px] py-[8px] text-black transition-colors hover:bg-accent-subtle hover:text-warning">
                            <p className="text-[16px] font-medium">View Details</p>
                            <Icon name="chevron3" className="h-[24px] w-[24px] shrink-0" fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
