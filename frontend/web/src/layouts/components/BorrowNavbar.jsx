import { useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from 'cn'
import { Logo } from '@/components/ui/Logo'
import { NotificationToggle } from '@/features/borrow/notifications/NotificationToggle'
import { ProfileToggle } from '@/features/users/components/ProfileToggle'
import { BorrowSummaryModal } from '@/features/borrow/request/components/BorrowSummaryModal'
import { useUser } from '@/lib/auth'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'
import { useSetState } from '@shared/hooks/useSetState'
import { Icon } from '@/components/ui/Icon'

const defaultBookings = Object.freeze([])
const defaultSidebarLinks = Object.freeze([])
const noop = () => null

const renderLinkIcon = (resolvedIcon) => {
    if (typeof resolvedIcon === 'string') {
        return <Icon name={resolvedIcon} className="size-5 shrink-0" />
    }
    if (resolvedIcon) {
        const IconComponent = resolvedIcon
        return <IconComponent className="size-5 shrink-0" />
    }
    return null
}

export const BorrowNavbar = ({
    bookings = defaultBookings,
    onSelectTab = noop,
    onSelectNotificationStatus = noop,
    sidebarLinks = defaultSidebarLinks,
    activeTab = ''
}) => {
    const { data: user } = useUser()
    const count = useBookingCartStore((state) => state.items.length)
    const [{ isSummaryOpen, isMenuOpen }, setNavbarState] = useSetState({
        isSummaryOpen: false,
        isMenuOpen: false
    })

    const handleTabClick = useCallback(
        (event) => {
            const { label } = event.currentTarget.dataset
            if (label) {
                onSelectTab(label)
                setNavbarState({ isMenuOpen: false })
            }
        },
        [onSelectTab, setNavbarState]
    )

    const handleOpenSummary = useCallback(() => {
        setNavbarState({ isSummaryOpen: true, isMenuOpen: false })
    }, [setNavbarState])

    const handleCloseSummary = useCallback(() => {
        setNavbarState({ isSummaryOpen: false })
    }, [setNavbarState])

    const handleToggleMenu = useCallback(() => {
        setNavbarState((prev) => ({ isMenuOpen: !prev.isMenuOpen }))
    }, [setNavbarState])

    const handleCloseMenu = useCallback(() => {
        setNavbarState({ isMenuOpen: false })
    }, [setNavbarState])

    return (
        <nav className="w-full h-16 lg:h-20 shrink-0 bg-white shadow-sm relative z-40">
            <div className="w-full px-4 lg:px-[90px] h-full flex items-center justify-between">
                <Logo link={false} />
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
                    <button
                        type="button"
                        aria-label="Open Booking Summary"
                        onClick={handleOpenSummary}
                        className="relative flex h-[25px] w-[30px] shrink-0 items-center justify-center cursor-pointer">
                        <Icon name="summary" className="h-[25px] w-[30px] shrink-0" />
                        {count > 0 ? (
                            <span className="select-none absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[12px] text-surface flex items-center justify-center">
                                {count}
                            </span>
                        ) : null}
                    </button>
                    <NotificationToggle
                        bookings={bookings}
                        onSelectNotification={onSelectNotificationStatus}
                        onOpen={handleCloseMenu}
                    />
                    <ProfileToggle user={user} onOpen={handleCloseMenu} />
                    {sidebarLinks.length > 0 ? (
                        <div className="flex lg:hidden items-center">
                            <button
                                type="button"
                                aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
                                onClick={handleToggleMenu}
                                className="p-2 rounded-lg text-text hover:bg-slate-100 transition-colors cursor-pointer">
                                {isMenuOpen ? (
                                    <X className="size-6 text-text" />
                                ) : (
                                    <Menu className="size-6 text-text" />
                                )}
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {isMenuOpen ? (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        tabIndex={-1}
                        className="fixed inset-0 top-16 lg:top-20 bg-black/30 backdrop-blur-xs z-30 lg:hidden border-none outline-none cursor-default"
                        onClick={handleCloseMenu}
                    />
                    <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 flex flex-col gap-2 z-40 lg:hidden font-['Poppins']">
                        {sidebarLinks.map((link) => {
                            const { label, Icon: LinkIcon, icon } = link
                            const resolvedIcon = icon || LinkIcon
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    data-label={label}
                                    onClick={handleTabClick}
                                    className={cn(
                                        "w-full h-12 px-4 rounded-lg flex items-center gap-3 text-base font-medium font-['Poppins'] transition-colors",
                                        {
                                            'bg-sky-800 text-white': activeTab === label,
                                            'bg-slate-50 text-text hover:bg-accent-subtle': activeTab !== label
                                        }
                                    )}>
                                    {renderLinkIcon(resolvedIcon)}
                                    <span>{label}</span>
                                </button>
                            )
                        })}
                    </div>
                </>
            ) : null}

            <BorrowSummaryModal
                isOpen={isSummaryOpen}
                onClose={handleCloseSummary}
                onSelectTab={onSelectTab}
                user={user}
            />
        </nav>
    )
}
