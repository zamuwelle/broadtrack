import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'

const noop = () => null
const defaultOptions = Object.freeze([])

export const FilterDropdown = ({
    value = '',
    onChange = noop,
    options = defaultOptions,
    className = 'w-full lg:w-[280px] shrink-0'
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownReference = useRef(null)

    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const createSelectHandler = useCallback(
        (optionName) => () => {
            onChange(optionName)
            setIsOpen(false)
        },
        [onChange]
    )

    useEffect(() => {
        const handlePointerDown = (pointerEvent) => {
            if (dropdownReference.current && !dropdownReference.current.contains(pointerEvent.target)) {
                setIsOpen(false)
            }
        }
        globalThis.document.addEventListener('pointerdown', handlePointerDown)
        return () => globalThis.document.removeEventListener('pointerdown', handlePointerDown)
    }, [])

    return (
        <div ref={dropdownReference} className={`relative font-['Poppins'] ${className}`}>
            <button
                type="button"
                onClick={toggleOpen}
                className={`w-full h-[42px] px-4 bg-white border border-border-subtle flex items-center justify-between text-[14px] font-medium text-slate-800 transition cursor-pointer ${
                    isOpen ? 'rounded-t-[8px] rounded-b-none' : 'rounded-[8px]'
                }`}>
                <span className="flex-1 min-w-0 text-left truncate mr-2">{value}</span>
                <Icon
                    name="chevron4"
                    className={`w-2.5 h-2.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="absolute top-[41px] left-0 right-0 z-30 max-h-[320px] overflow-y-auto bg-white border border-t-0 border-border-subtle rounded-b-[8px] p-1.5 shadow-lg flex flex-col gap-1">
                    {options.map((optionName) => (
                        <button
                            key={optionName}
                            type="button"
                            onClick={createSelectHandler(optionName)}
                            className={`w-full h-[38px] shrink-0 text-left px-3 flex items-center text-[14px] rounded-[6px] transition cursor-pointer ${
                                value === optionName
                                    ? 'bg-border-focus font-medium text-slate-900'
                                    : 'text-slate-800 hover:bg-slate-100 font-normal'
                            }`}>
                            <span className="truncate">{optionName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
