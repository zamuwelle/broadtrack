import { useCallback, useEffect, useRef } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'

const defaultOptions = Object.freeze([])
const noop = () => null

export const CategorySelect = ({
    value,
    onChange = noop,
    options = defaultOptions,
    placeholder = 'Select',
    error = false,
    isOpen = false,
    onToggle = noop,
    onClose = noop
}) => {
    const dropdownReference = useRef(null)

    useEffect(() => {
        if (!isOpen) {
            return
        }
        const handleClickOutside = (event) => {
            if (dropdownReference.current && !dropdownReference.current.contains(event.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    const handleSelect = useCallback(
        (event) => {
            const { id } = event.currentTarget.dataset
            if (typeof id === 'string') {
                onChange(id)
                onClose()
            }
        },
        [onChange, onClose]
    )

    const selectedOption = options.find((option) => String(option.id) === String(value))

    return (
        <div className="relative font-['Poppins']" ref={dropdownReference}>
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    'w-full h-[40px] px-3.5 border text-[14px] bg-white flex items-center justify-between cursor-pointer outline-none focus:border-amber-500',
                    {
                        'rounded-t-[8px]': isOpen,
                        'rounded-[8px]': !isOpen,
                        'border-red-500': Boolean(error),
                        'border-border-subtle': !error
                    }
                )}>
                <span className={cn({ 'text-text': Boolean(selectedOption), 'text-muted': !selectedOption })}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <Icon name="chevron5" className={cn('text-slate-600 shrink-0', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-[1px] left-0 right-0 bg-white rounded-b-[8px] border border-border-subtle shadow-lg z-30 max-h-52 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            data-id={option.id}
                            onClick={handleSelect}
                            className="w-full h-10 px-4 flex items-center text-[14px] text-text hover:bg-gray-100 cursor-pointer text-left">
                            {option.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
