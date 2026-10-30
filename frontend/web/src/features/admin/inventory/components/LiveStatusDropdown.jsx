import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'
import { EQUIPMENT_STATUSES } from '@shared/constants'

const noop = () => null

const STATUS_CONFIGURATIONS = Object.freeze({
    available: {
        label: 'Available',
        icon: '🟢',
        pillClass: 'bg-green-100 outline outline-1 outline-offset-[-0.90px] outline-green-500 text-green-800',
        menuClass: 'bg-green-100 outline outline-1 outline-offset-[-1px] outline-green-500',
        itemTextClass: 'text-green-800'
    },
    booked: {
        label: 'Booked',
        icon: '🔴',
        pillClass: 'bg-rose-100 outline outline-1 outline-offset-[-0.90px] outline-rose-500 text-rose-800',
        menuClass: 'bg-rose-100 outline outline-1 outline-offset-[-1px] outline-rose-500',
        itemTextClass: 'text-rose-800'
    },
    borrowed: {
        label: 'Borrowed',
        icon: '🔵',
        pillClass: 'bg-blue-200 outline outline-1 outline-offset-[-0.90px] outline-sky-800 text-sky-800',
        menuClass: 'bg-blue-200 outline outline-1 outline-offset-[-1px] outline-sky-800',
        itemTextClass: 'text-sky-800'
    },
    maintenance: {
        label: 'Maintenance',
        icon: '🛠',
        pillClass: 'bg-orange-50 outline outline-1 outline-offset-[-0.90px] outline-amber-500 text-amber-800',
        menuClass: 'bg-orange-50 outline outline-1 outline-offset-[-1px] outline-amber-500',
        itemTextClass: 'text-amber-800'
    }
})

export const LiveStatusDropdown = ({ currentStatus = 'available', onSelectStatus = noop }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownReference = useRef(null)

    const activeConfiguration = STATUS_CONFIGURATIONS[currentStatus] || STATUS_CONFIGURATIONS.available

    useEffect(() => {
        if (!isOpen) {
            return
        }
        const handleClickOutside = (event) => {
            if (dropdownReference.current && !dropdownReference.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const handleSelect = useCallback(
        (event) => {
            const { status } = event.currentTarget.dataset
            if (status) {
                onSelectStatus(status)
                setIsOpen(false)
            }
        },
        [onSelectStatus]
    )

    return (
        <div className="w-32 h-6 relative font-['Poppins']" ref={dropdownReference}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    'w-32 h-6 left-0 top-0 absolute rounded-2xl flex items-center justify-between px-3 text-[9.89px] font-semibold cursor-pointer',
                    activeConfiguration.pillClass
                )}>
                <span className="flex items-center gap-1">
                    <span>{activeConfiguration.icon}</span>
                    <span>{activeConfiguration.label}</span>
                </span>
                <Icon name="chevron5" className={cn('shrink-0', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        'w-28 left-[9px] top-[23.25px] absolute rounded-b-xl z-30 inline-flex flex-col justify-start items-start overflow-hidden shadow-md',
                        activeConfiguration.menuClass
                    )}>
                    {EQUIPMENT_STATUSES.map((statusKey) => {
                        const optionConfig = STATUS_CONFIGURATIONS[statusKey]
                        return (
                            <button
                                key={statusKey}
                                type="button"
                                data-status={statusKey}
                                onClick={handleSelect}
                                className="self-stretch h-6 px-3 flex items-center gap-1.5 hover:bg-black/5 cursor-pointer text-left">
                                <span className="text-[9.89px] leading-none">{optionConfig.icon}</span>
                                <span className={cn('text-[9.89px] font-semibold', optionConfig.itemTextClass)}>
                                    {optionConfig.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
