import { cn } from 'cn'

const badgeConfigurations = Object.freeze({
    available: {
        style: 'bg-green-100 outline-green-500 text-green-500',
        label: 'AVAILABLE'
    },
    booked: {
        style: 'bg-blue-600 outline-blue-600 text-white',
        label: 'BOOKED'
    },
    borrowed: {
        style: 'bg-blue-200 outline-sky-800 text-sky-800',
        label: 'BORROWED'
    },
    maintenance: {
        style: 'bg-orange-50 outline-amber-500 text-amber-500',
        label: 'MAINTENANCE'
    }
})

export const StatusBadge = ({ status, className = '' }) => {
    const normalizedStatus = (typeof status === 'string' ? status : status?.status || 'available').toLowerCase()
    const badge = badgeConfigurations[normalizedStatus] ?? badgeConfigurations.available

    return (
        <div
            className={cn(
                "h-6 px-1.5 py-1 rounded-xl outline outline-[0.50px] outline-offset-[-0.50px] inline-flex justify-center items-center gap-2.5 font-['Poppins']",
                badge.style,
                className
            )}>
            <div className="text-center justify-start text-xs font-semibold font-['Poppins']">{badge.label}</div>
        </div>
    )
}
