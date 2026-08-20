import { useCallback, useMemo } from 'react'
import { Icon as IconComponent } from '@/components/ui/Icon'
import { useToggle } from '@/hooks/ui/useToggle'

const openStyle = Object.freeze({ borderTopLeftRadius: 0, borderTopRightRadius: 0 })
const emptyStyle = Object.freeze({})
const defaultOptions = Object.freeze([])

const renderIcon = (icon) => {
    if (!icon) {
        return null
    }
    if (typeof icon === 'string') {
        return <IconComponent name={icon} />
    }
    if (typeof icon === 'function') {
        const CustomIcon = icon
        return <CustomIcon />
    }
    return icon
}

export const Select = ({
    value,
    onChange,
    options = defaultOptions,
    placeholder = '',
    icon: Icon,
    error,
    className = '',
    wrapperClass = '',
    panelClass = '',
    hoverClass = 'hover:bg-gray-100',
    selectedClass = ''
}) => {
    const { open, setOpen, boxRef } = useToggle()

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev)
    }, [setOpen])

    const createOptionClickHandler = useCallback(
        (option) => () => {
            if (onChange) {
                onChange(option)
            }
            setOpen(false)
        },
        [onChange, setOpen]
    )

    const dynamicStyle = useMemo(() => (open ? openStyle : emptyStyle), [open])

    return (
        <div ref={boxRef} className={`relative flex ${wrapperClass}`}>
            <button
                type="button"
                onClick={toggleOpen}
                style={dynamicStyle}
                className={`flex items-center text-left cursor-pointer rounded-[8px] ${error ? 'border-red-500' : ''} ${className}`}
                title={value || placeholder}>
                {Icon ? (
                    <>
                        {renderIcon(Icon)}
                        <span className="w-px h-6 bg-border-subtle" />
                    </>
                ) : null}
                <span className={`flex-1 truncate ${value ? '' : 'text-muted'}`}>{value || placeholder}</span>
                <IconComponent
                    name="chevron2"
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div
                    className={`absolute bottom-full left-0 right-0 z-30 mb-[1px] rounded-t-[8px] border border-border-subtle ${panelClass}`}>
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={createOptionClickHandler(option)}
                            className={`w-full h-10 px-4 flex items-center text-left text-[14px] whitespace-nowrap text-text cursor-pointer ${value === option ? selectedClass : ''} ${hoverClass}`}>
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
