import { useCallback, useState } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'

const noop = () => null

export const SelectButton = ({ selected = null, onSelect = noop, disabled = false, className = '' }) => {
    const [internalSelected, setInternalSelected] = useState(false)
    const isSelected = selected === null ? internalSelected : selected

    const handleToggle = useCallback(() => {
        if (disabled) {
            return
        }
        if (selected === null) {
            setInternalSelected((prev) => !prev)
        }
        onSelect(!isSelected)
    }, [disabled, selected, isSelected, onSelect])

    if (disabled) {
        return (
            <button
                type="button"
                disabled
                className={cn(
                    'relative inline-flex h-[28px] items-center justify-center rounded-[8px] border-[0.5px] border-border-subtle bg-slate-100 px-[12px] text-[14px] font-medium text-slate-400 opacity-60 cursor-not-allowed',
                    className
                )}>
                Unavailable
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={cn(
                {
                    'h-8 px-3 py-2 bg-green-500 rounded-lg outline outline-[0.50px] outline-offset-[-0.50px] outline-green-500 inline-flex justify-center items-center gap-0.5 text-white text-base font-medium':
                        isSelected,
                    'relative inline-flex h-[28px] items-center justify-center rounded-[8px] border-[0.5px] border-border-subtle bg-background px-[12px] text-[16px] font-medium':
                        !isSelected
                },
                className
            )}>
            {isSelected ? (
                <>
                    Selected
                    <Icon name="check" />
                </>
            ) : (
                '+ Select'
            )}
        </button>
    )
}
