import { StatusBadge } from '@/features/borrow/equipment/components/StatusBadge'
import { XButton } from '@/components/ui/XButton'
import { ScheduleNotice } from '@/features/borrow/equipment/components/ScheduleNotice'
import { SelectButton } from '@/features/borrow/equipment/components/SelectButton'
import { getOptimizedImageUrl } from '@shared/util/image'

const defaultEquipment = Object.freeze({})
const noop = () => null

export const EquipmentExpandedCard = ({
    equipment = defaultEquipment,
    modelName = '',
    categoryName = '',
    isSelectable = false,
    isSelected = false,
    onToggleSelect = noop,
    onCollapse = noop
}) => {
    const specLines = (equipment.specs ?? '').split('\n').filter(Boolean)

    return (
        <div className="scroll-mb-[24px] w-full overflow-hidden rounded-[8px] border border-border-subtle bg-surface shadow-[0px_4px_4px_rgba(0,0,0,0.05)]">
            <div className={`relative flex h-[267px] items-start justify-end gap-[14px] border-b border-border-subtle ${equipment.image ? 'bg-white' : 'bg-slate-100'} pr-[19px] pt-[22px]`}>
                {equipment.image ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4 pt-10 pointer-events-none">
                        <img
                            src={getOptimizedImageUrl(equipment.image, 800, 500)}
                            alt={equipment.name}
                            className="h-full w-full object-contain"
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                    </div>
                ) : null}
                {isSelectable ? (
                    <SelectButton selected={isSelected} onSelect={onToggleSelect} className="relative z-10" />
                ) : null}
                <XButton onClick={onCollapse} className="relative z-10 flex h-[30px] w-[30px] items-center justify-center" />
            </div>
            <div className="flex flex-col gap-[10px] px-4 py-5 lg:px-[26px] lg:py-[28px]">
                <div className="flex items-start justify-between">
                    <p className="text-[18.17px] font-semibold">{equipment.name}</p>
                    <span className="inline-flex items-center justify-center rounded-[12px] border-[0.5px] border-icon-subtle bg-surface px-[8px] py-[4px] text-[12px]">
                        {categoryName}
                    </span>
                </div>
                <p className="text-[12px] text-muted">{modelName}</p>
                <div className="flex min-h-[72px] items-center justify-between rounded-[8px] border border-border-divider bg-surface-muted/40 py-[10px] pl-[14px] pr-[15px]">
                    <div className="flex flex-col gap-[2px]">
                        <p className="text-[12px] text-muted">SERIAL NO</p>
                        <p className="text-[12px] text-text">{equipment.serial_no || '—'}</p>
                    </div>
                    <div className="flex w-[90px] flex-col items-center gap-[7px]">
                        <p className="text-[12px] text-muted">AVAILABILITY</p>
                        <StatusBadge status={equipment.status} className="self-stretch" />
                    </div>
                </div>
                <p className="text-[14px] font-bold text-muted">PRODUCT SPECS</p>
                <ul className="list-disc pl-[20px] text-[14px] text-muted">
                    {specLines.map((line) => (
                        <li key={`spec-${line}`}>{line}</li>
                    ))}
                </ul>
                <div className="h-0 border-t-[1.3px] border-border-divider" />
                <div className="flex flex-col gap-[10px]">
                    <p className="text-[14px] font-bold text-muted">ITEM BOOK SCHEDULE</p>
                    <ScheduleNotice status={equipment.status} equipment={equipment} />
                </div>
            </div>
        </div>
    )
}
