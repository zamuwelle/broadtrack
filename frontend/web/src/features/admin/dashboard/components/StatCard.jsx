import { cn } from 'cn'

export const StatCard = ({ title = '', value = 0, unit = '', isAmber = false }) => {
    const isHighlighted = isAmber && value > 0

    return (
        <div className="bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] border border-gray-200 px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col justify-between h-20 sm:h-24">
            <div
                className={cn('text-xs sm:text-base font-medium truncate', {
                    'text-amber-500': isHighlighted,
                    'text-gray-900': !isHighlighted
                })}>
                {title}
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span
                    className={cn('text-2xl sm:text-3xl font-medium', {
                        'text-amber-500': isHighlighted,
                        'text-gray-900': !isHighlighted
                    })}>
                    {value}
                </span>
                <span
                    className={cn('text-xs sm:text-sm font-medium truncate', {
                        'text-amber-500': isHighlighted,
                        'text-gray-500': !isHighlighted
                    })}>
                    {unit}
                </span>
            </div>
        </div>
    )
}
