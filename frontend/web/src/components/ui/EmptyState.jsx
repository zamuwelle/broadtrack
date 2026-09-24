import { cn } from 'cn'
import { Icon as IconComponent } from '@/components/ui/Icon'

export const EmptyState = ({ icon: Icon, title, description, className = '' }) => {
    let iconElement = null
    if (typeof Icon === 'string') {
        iconElement = <IconComponent name={Icon} className="size-11 text-slate-400 stroke-[1.25]" />
    } else if (Icon) {
        iconElement = <Icon className="size-11 text-slate-400 stroke-[1.25]" />
    }

    return (
        <div
            className={cn(
                'w-full bg-white rounded-2xl border border-slate-200 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] py-16 px-6 flex flex-col items-center justify-center gap-3 text-center',
                className
            )}>
            {iconElement}
            <h3 className="text-slate-600 font-medium text-base font-['Poppins']">{title}</h3>
            {description ? <p className="text-slate-400 text-sm font-normal font-['Poppins']">{description}</p> : null}
        </div>
    )
}
