import { useCallback } from 'react'

const defaultCategories = Object.freeze(['All'])
const noop = () => null

export const CategoryButtons = ({
    categories = defaultCategories,
    options = categories,
    selected = 'All',
    onSelect = noop
}) => {
    const handleClick = useCallback(
        (event) => {
            const { option } = event.currentTarget.dataset
            if (option) {
                onSelect(option)
            }
        },
        [onSelect]
    )

    return (
        <div className="flex flex-wrap gap-[12px]">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    data-option={option}
                    onClick={handleClick}
                    className={`h-[38px] px-4 rounded-[8px] text-[15px] font-medium flex items-center justify-center border transition-colors cursor-pointer font-['Poppins'] ${
                        selected === option
                            ? 'bg-primary text-surface border-transparent shadow-xs'
                            : 'bg-background text-text border-border-subtle hover:bg-accent-subtle hover:border-accent-subtle'
                    }`}>
                    {option}
                </button>
            ))}
        </div>
    )
}
