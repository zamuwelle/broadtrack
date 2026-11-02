import { useCallback } from 'react'
import { cn } from 'cn'
import { Icon as IconComponent } from '@/components/ui/Icon'

const defaultLinks = Object.freeze([])

const renderIcon = (icon) => {
    if (!icon) {
        return null
    }
    if (typeof icon === 'string') {
        return <IconComponent name={icon} className="size-5 shrink-0" />
    }
    const CustomIcon = icon
    return <CustomIcon className="size-5 shrink-0" />
}

export const Sidebar = ({ links = defaultLinks, active, onSelect, className = '', contentWidth = 'w-[136px]' }) => {
    const createSelectHandler = useCallback(
        (label) => () => {
            if (onSelect) {
                onSelect(label)
            }
        },
        [onSelect]
    )

    return (
        <aside
            className={cn(
                'w-[308px] h-full shrink-0 bg-white pt-[59px] px-[26px] flex flex-col gap-6 overflow-y-auto',
                className
            )}>
            {links.map(({ label, Icon, icon, divider, centered }) => {
                const resolvedIcon = icon || Icon
                return divider ? (
                    <div key={label ?? 'divider'} className="w-full border-t border-slate-300 my-2" />
                ) : (
                    <button
                        key={label}
                        type="button"
                        onClick={createSelectHandler(label)}
                        className={cn(
                            "w-full h-16 shrink-0 rounded-lg flex items-center justify-center text-base font-medium font-['Poppins'] transition-colors cursor-pointer",
                            {
                                'bg-sky-800 text-white': active === label,
                                'bg-slate-50 text-text hover:bg-accent-subtle': active !== label
                            }
                        )}>
                        {resolvedIcon ? (
                            <div className={cn('flex items-center gap-2.5', !centered && contentWidth)}>
                                {renderIcon(resolvedIcon)}
                                <span className="whitespace-nowrap">{label}</span>
                            </div>
                        ) : (
                            <span className="whitespace-nowrap">{label}</span>
                        )}
                    </button>
                )
            })}
        </aside>
    )
}
