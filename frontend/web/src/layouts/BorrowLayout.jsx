import { useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from 'cn'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { useEquipment } from '@/features/equipment/api/get-equipment'
import { useBookingNotification } from '@/hooks/queries/useBookingNotification'
import { getNotificationConfig } from '@/features/borrow/notifications/notificationConfig'
import { setGlobalUnreadCount } from '@/hooks/ui/useDocumentTitle'
import { BorrowNavbar } from '@/layouts/components/BorrowNavbar'
import { Sidebar } from '@/components/ui/Sidebar'
import { paths } from '@/config/paths'

const sidebarLinks = Object.freeze([
    Object.freeze({ label: 'Equipment', icon: 'equipment', path: paths.app.borrowEquipment }),
    Object.freeze({ label: 'Calendar', icon: 'calendar', path: paths.app.borrowCalendar }),
    Object.freeze({ label: 'My Slips', icon: 'slip', path: paths.app.borrowSlips })
])

const pathToLabelMap = Object.freeze({
    [paths.app.borrowEquipment]: 'Equipment',
    [paths.app.borrowCalendar]: 'Calendar',
    [paths.app.borrowSlips]: 'My Slips'
})

const labelToPathMap = Object.freeze({
    Equipment: paths.app.borrowEquipment,
    Calendar: paths.app.borrowCalendar,
    'My Slips': paths.app.borrowSlips
})

export const Component = ({ onReady, children }) => {
    const mainReference = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    const activeTab = useMemo(() => {
        const matchingPath = Object.keys(pathToLabelMap).find((path) => location.pathname.startsWith(path))
        return matchingPath ? pathToLabelMap[matchingPath] : 'Equipment'
    }, [location.pathname])

    useEffect(() => {
        if (mainReference.current) {
            mainReference.current.scrollTo(0, 0)
        }
    }, [location.pathname])

    const { isLoading: isEquipmentLoading } = useEquipment()
    const { data: bookings = [], isLoading: isBookingsLoading } = useBookings()
    const isReady = !isEquipmentLoading && !isBookingsLoading

    const unreadCount = useMemo(
        () =>
            bookings.filter((booking) => {
                const hasUpdate = Boolean(getNotificationConfig(booking))
                const isRead = Boolean(booking.isRead ?? booking.is_read)
                return hasUpdate && !isRead
            }).length,
        [bookings]
    )

    useEffect(() => {
        setGlobalUnreadCount(unreadCount)
        return () => {
            setGlobalUnreadCount(0)
        }
    }, [unreadCount])

    useEffect(() => {
        if (isReady && typeof onReady === 'function') {
            onReady()
        }
    }, [isReady, onReady])

    const handleSelectTab = useCallback(
        (tabLabel) => {
            const targetPath = labelToPathMap[tabLabel]
            if (targetPath && targetPath !== location.pathname) {
                navigate(targetPath)
            }
        },
        [location.pathname, navigate]
    )

    const handleSelectNotificationStatus = useCallback(
        (filterStatus) => {
            const query = filterStatus ? `?status=${encodeURIComponent(filterStatus)}` : ''
            navigate(`${paths.app.borrowSlips}${query}`)
        },
        [navigate]
    )

    useBookingNotification(handleSelectNotificationStatus)

    const containerClass = activeTab === 'Calendar' ? 'flex-1 flex flex-col p-4 lg:min-h-0 lg:p-8' : 'p-4 lg:p-8'

    return (
        <div className={cn("flex flex-col font-['Poppins']", activeTab === 'Calendar' ? 'h-dvh' : 'h-screen')}>
            <BorrowNavbar
                bookings={bookings}
                onSelectTab={handleSelectTab}
                onSelectNotificationStatus={handleSelectNotificationStatus}
                sidebarLinks={sidebarLinks}
                activeTab={activeTab}
            />
            <div className="flex flex-1 min-h-0">
                <Sidebar
                    links={sidebarLinks}
                    active={activeTab}
                    onSelect={handleSelectTab}
                    contentWidth="w-[122px]"
                    className="hidden lg:flex"
                />
                <main ref={mainReference} className="flex-1 overflow-y-auto bg-background flex flex-col">
                    <div className={containerClass}>{children ?? <Outlet />}</div>
                </main>
            </div>
        </div>
    )
}
