import { useCallback } from 'react'
import { cn } from 'cn'

const defaultItem = Object.freeze({})
const noop = () => null

export const AdminMobileLinkItem = ({ item = defaultItem, activeTab = '', onSelectTab = noop }) => {
    const { label, Icon, divider } = item
    const handleClick = useCallback(() => {
        onSelectTab(label)
    }, [label, onSelectTab])

    if (divider) {
        return <div className="w-full border-t border-slate-200 my-1" />
    }

    const isActive = activeTab === label

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'w-full h-12 px-4 rounded-lg flex items-center gap-3 text-base font-medium transition-colors',
                {
                    'bg-sky-800 text-white': isActive,
                    'bg-slate-50 text-text hover:bg-accent-subtle': !isActive
                }
            )}>
            {Icon ? <Icon className="size-5 shrink-0" /> : null}
            <span>{label}</span>
        </button>
    )
}
