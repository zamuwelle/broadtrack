import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search camera, lenses, mics, lights...',
    className = ''
}) => {
    const handleInputChange = useCallback(
        ({ target }) => {
            if (onChange) {
                onChange(target.value)
            }
        },
        [onChange]
    )

    return (
        <div
            className={`w-full h-[46px] bg-background border border-muted rounded-[8px] flex items-center gap-[18px] px-[22px] py-[10px] ${className}`}>
            <Icon name="search" />
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-text placeholder:text-muted"
            />
        </div>
    )
}
