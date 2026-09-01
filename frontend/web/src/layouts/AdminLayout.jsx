import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AdminNavbar } from '@/features/admin/components/AdminNavbar'
import { Sidebar } from '@/components/ui/Sidebar'
import { Banner } from '@/components/ui/Banner'
import { useEquipment } from '@/api/equipment/get-equipment'
import { useBookings } from '@/api/bookings/get-bookings'
import { useUsers } from '@/api/users/get-users'
import { useBookingNotification } from '@/hooks/queries/useBookingNotification'
import { useUser } from '@/lib/auth'
import { ROLES } from '@shared/constants'
import { paths } from '@/config/paths'

const baseSidebarLinks = Object.freeze([
    Object.freeze({ label: 'Dashboard', icon: 'equipment', path: paths.app.adminDashboard }),
    Object.freeze({ label: 'Approvals', icon: 'approval', path: paths.app.adminApprovals }),
    Object.freeze({ label: 'Inventory', icon: 'adminInventory', path: paths.app.adminInventory }),
    Object.freeze({ label: 'Transactions', icon: 'transactions', path: paths.app.adminTransactions })
])

const sysadminLinks = Object.freeze([
    ...baseSidebarLinks,
    Object.freeze({ divider: true }),
    Object.freeze({ label: 'User Management', icon: 'users', centered: true, path: paths.app.adminUsers })
])

const pathToLabelMap = Object.freeze({
    [paths.app.adminDashboard]: 'Dashboard',
    [paths.app.adminApprovals]: 'Approvals',
    [paths.app.adminInventory]: 'Inventory',
    [paths.app.adminTransactions]: 'Transactions',
    [paths.app.adminUsers]: 'User Management'
})

const labelToPathMap = Object.freeze({
    Dashboard: paths.app.adminDashboard,
    Approvals: paths.app.adminApprovals,
    Inventory: paths.app.adminInventory,
    Transactions: paths.app.adminTransactions,
    'User Management': paths.app.adminUsers
})

export const Component = ({ onReady, children }) => {
    const mainReference = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    const activeTab = useMemo(() => {
        const matchingPath = Object.keys(pathToLabelMap).find((path) => location.pathname.startsWith(path))
        return matchingPath ? pathToLabelMap[matchingPath] : 'Dashboard'
    }, [location.pathname])

    useEffect(() => {
        if (mainReference.current) {
            mainReference.current.scrollTo(0, 0)
        }
    }, [location.pathname])

    const { data: user } = useUser()
    const isSysAdmin = Boolean(user && user.role === ROLES.SYSADMIN)
    const sidebarLinks = isSysAdmin ? sysadminLinks : baseSidebarLinks

    const { isLoading: isEquipmentLoading } = useEquipment()
    const { isLoading: isBookingsLoading } = useBookings()
    const usersOptions = useMemo(() => Object.freeze({ enabled: isSysAdmin }), [isSysAdmin])
    const { isLoading: isUsersLoading } = useUsers({ queryConfig: usersOptions })
    const isReady = !isEquipmentLoading && !isBookingsLoading && (!isSysAdmin || !isUsersLoading)

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

    const handleNotification = useCallback(() => {
        navigate(paths.app.adminApprovals)
    }, [navigate])

    useBookingNotification(handleNotification)

    if (!isReady) {
        return null
    }

    return (
        <div className="h-screen flex flex-col font-['Poppins']">
            <AdminNavbar sidebarLinks={sidebarLinks} activeTab={activeTab} onSelectTab={handleSelectTab} />
            <div className="flex flex-1 min-h-0">
                <Sidebar
                    links={sidebarLinks}
                    active={activeTab}
                    onSelect={handleSelectTab}
                    contentWidth="w-[136px]"
                    className="hidden lg:flex"
                />
                <main ref={mainReference} className="flex-1 overflow-y-auto bg-background">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {activeTab !== 'User Management' && (
                            <Banner title="Broadtrack Operations">
                                <span>
                                    Manage equipment inventory, review reservation requests, monitor active
                                    transactions,
                                </span>
                                <span className="block">and keep track of equipment maintenance.</span>
                            </Banner>
                        )}
                        {children ?? <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    )
}
