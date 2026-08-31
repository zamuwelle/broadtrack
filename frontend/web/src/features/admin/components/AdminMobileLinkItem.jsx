import { useCallback } from 'react'

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
    const buttonClass = isActive ? 'bg-sky-800 text-white' : 'bg-slate-50 text-text hover:bg-accent-subtle'

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`w-full h-12 px-4 rounded-lg flex items-center gap-3 text-base font-medium transition-colors ${buttonClass}`}>
            {Icon ? <Icon className="size-5 shrink-0" /> : null}
            <span>{label}</span>
        </button>
    )
}
