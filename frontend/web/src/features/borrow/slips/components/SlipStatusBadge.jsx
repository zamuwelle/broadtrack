import { cn } from 'cn'

const statusBadgeMap = Object.freeze({
    approved: {
        bg: 'bg-green-500/20',
        outline: 'outline-green-500',
        text: 'text-green-500'
    },
    pending: {
        bg: 'bg-amber-500/20',
        outline: 'outline-amber-500',
        text: 'text-amber-500'
    },
    cancelled: {
        bg: 'bg-slate-50/25',
        outline: 'outline-neutral-400',
        text: 'text-neutral-500'
    },
    canceled: {
        bg: 'bg-slate-50/25',
        outline: 'outline-neutral-400',
        text: 'text-neutral-500'
    },
    returned: {
        bg: 'bg-blue-600/20',
        outline: 'outline-blue-600',
        text: 'text-blue-600'
    },
    rejected: {
        bg: 'bg-red-500/20',
        outline: 'outline-red-400',
        text: 'text-red-700'
    }
})

const defaultBadge = Object.freeze({
    bg: 'bg-slate-100',
    outline: 'outline-slate-300',
    text: 'text-slate-600'
})

export const SlipStatusBadge = ({ status = '' }) => {
    const normalizedStatus = String(status || '').toLowerCase()
    const badge = statusBadgeMap[normalizedStatus] || defaultBadge

    return (
        <div
            className={cn(
                'h-6 px-2 py-0.5 rounded-xl outline outline-[0.50px] outline-offset-[-0.50px] flex items-center justify-center',
                badge.bg,
                badge.outline
            )}>
            <span className={cn('text-center text-xs font-semibold', badge.text)}>
                {normalizedStatus === 'canceled' ? 'CANCELLED' : normalizedStatus.toUpperCase()}
            </span>
        </div>
    )
}
