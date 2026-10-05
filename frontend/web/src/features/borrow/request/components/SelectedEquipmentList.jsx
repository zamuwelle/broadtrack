import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { getOptimizedImageUrl } from '@shared/util/image'

const noop = () => null
const defaultSelectedItems = Object.freeze([])

export const SelectedEquipmentList = ({ selectedItems = defaultSelectedItems, onRemove = noop }) => {
    const handleRemoveClick = useCallback(
        (event) => {
            const { id } = event.currentTarget.dataset
            if (id) {
                onRemove(Number(id))
            }
        },
        [onRemove]
    )

    return (
        <div className="flex w-full flex-col items-start justify-start gap-4">
            <span className="text-xs font-normal text-neutral-400">
                SELECTED EQUIPMENT ({selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'})
            </span>
            <div className="flex w-full flex-col items-start justify-start gap-4">
                {selectedItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex h-24 w-full items-start justify-start gap-2.5 overflow-hidden rounded-lg bg-white pr-4 outline outline-1 outline-offset-[-1px] outline-slate-300">
                        <div className="inline-flex w-full items-center justify-start gap-4">
                            {item.image ? (
                                <img
                                    className="size-24 rounded-bl-lg rounded-tl-lg bg-white border-r border-slate-200 object-contain p-1.5"
                                    src={getOptimizedImageUrl(item.image, 200)}
                                    alt={item.name}
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <div className="size-24 rounded-bl-lg rounded-tl-lg bg-slate-100 shrink-0" />
                            )}
                            <div className="flex flex-1 items-center justify-between">
                                <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                                    <span className="text-xs font-semibold text-text">{item.name}</span>
                                    <span className="text-xs font-normal text-text">{item.serial_no || 'S/N'}</span>
                                </div>
                                <button
                                    type="button"
                                    data-id={item.id}
                                    onClick={handleRemoveClick}
                                    className="cursor-pointer hover:opacity-80">
                                    <Icon name="trash" className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
