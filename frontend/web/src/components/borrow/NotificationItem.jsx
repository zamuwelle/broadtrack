import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'

export const NotificationItem = ({ item, onClick }) => {
    const { icon, headline, details, timestamp } = item

    const handleClick = useCallback(() => {
        onClick(item)
    }, [item, onClick])

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex h-24 w-full shrink-0 cursor-pointer flex-col justify-start items-start gap-[3px] rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-200 text-left">
            <div className="inline-flex w-full items-center justify-start gap-1">
                {icon && <Icon name={icon} className="size-4 shrink-0" />}
                <span className="flex-1 text-sm font-normal text-slate-900">{headline}</span>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-[3px]">
                <span className="text-xs font-normal text-slate-800 line-clamp-1">{details}</span>
                <span className="text-xs font-normal text-sky-800">{timestamp}</span>
            </div>
        </button>
    )
}
