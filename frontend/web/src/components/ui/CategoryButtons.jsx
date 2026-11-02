import { useCallback } from 'react'
import { cn } from 'cn'

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
        <div className="flex flex-wrap gap-[12px] max-lg:min-w-0 max-lg:flex-1 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:[scrollbar-width:none]! max-lg:[&::-webkit-scrollbar]:hidden! max-lg:[&>button]:shrink-0">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    data-option={option}
                    onClick={handleClick}
                    className={cn(
                        "h-[38px] px-4 rounded-[8px] text-[15px] font-medium flex items-center justify-center border transition-colors cursor-pointer font-['Poppins']",
                        {
                            'bg-primary text-surface border-transparent shadow-xs': selected === option,
                            'bg-background text-text border-border-subtle hover:bg-accent-subtle hover:border-accent-subtle':
                                selected !== option
                        }
                    )}>
                    {option}
                </button>
            ))}
        </div>
    )
}
