import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AdminNavbar } from '@/components/admin/AdminNavbar'
import { Sidebar } from '@/components/ui/Sidebar'
import { Banner } from '@/components/ui/Banner'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { ApprovalsPage } from '@/pages/admin/ApprovalsPage'
import { InventoryPage } from '@/pages/admin/InventoryPage'
import { TransactionsPage } from '@/pages/admin/TransactionsPage'
import { UserManagementPage } from '@/pages/admin/UserManagementPage'
import { useEquipment } from '@/hooks/queries/useEquipment'
import { useBookings } from '@/hooks/queries/useBookings'
import { useUsers } from '@/hooks/queries/useUsers'
import { useBookingNotification } from '@/hooks/queries/useBookingNotification'
import { useUser } from '@/hooks/queries/useUser'
import { useSidebarTab } from '@/hooks/ui/useSidebarTab'

const baseSidebarLinks = Object.freeze([
    Object.freeze({ label: 'Dashboard', icon: 'equipment' }),
    Object.freeze({ label: 'Approvals', icon: 'approval' }),
    Object.freeze({ label: 'Inventory', icon: 'adminInventory' }),
    Object.freeze({ label: 'Transactions', icon: 'transactions' })
])

const sysadminLinks = Object.freeze([
    ...baseSidebarLinks,
    Object.freeze({ divider: true }),
    Object.freeze({ label: 'User Management', icon: 'users', centered: true })
])

const pages = Object.freeze({
    Dashboard: DashboardPage,
    Approvals: ApprovalsPage,
    Inventory: InventoryPage,
    Transactions: TransactionsPage,
    'User Management': UserManagementPage
})

export const AdminPage = (props) => {
    const { onReady } = props
    const mainReference = useRef(null)
    const [active, setActive] = useSidebarTab('admin', 'Dashboard')

    useEffect(() => {
        if (mainReference.current) {
            mainReference.current.scrollTo(0, 0)
        }
    }, [active])

    const { data: user } = useUser()
    const isSysAdmin = Boolean(user && user.role === 'sysadmin')
    const sidebarLinks = isSysAdmin ? sysadminLinks : baseSidebarLinks

    const { data: equipment, isLoading: isEquipmentLoading } = useEquipment()
    const { data: bookings, isLoading: isBookingsLoading } = useBookings()
    const usersOptions = useMemo(() => Object.freeze({ enabled: isSysAdmin }), [isSysAdmin])
    const { data: users, isLoading: isUsersLoading } = useUsers(usersOptions)
    const isReady = !isEquipmentLoading && !isBookingsLoading && (!isSysAdmin || !isUsersLoading)

    useEffect(() => {
        if (isReady && typeof onReady === 'function') {
            onReady()
        }
    }, [isReady, onReady])

    const handleNotification = useCallback(() => {
        setActive('Approvals')
    }, [setActive])

    useBookingNotification(handleNotification)

    if (!isReady) {
        return null
    }

    const Page = pages[active]

    return (
        <div className="h-screen flex flex-col font-['Poppins']">
            <AdminNavbar sidebarLinks={sidebarLinks} activeTab={active} onSelectTab={setActive} />
            <div className="flex flex-1 min-h-0">
                <Sidebar
                    links={sidebarLinks}
                    active={active}
                    onSelect={setActive}
                    contentWidth="w-[136px]"
                    className="hidden lg:flex"
                />
                <main ref={mainReference} className="flex-1 overflow-y-auto bg-background">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {Page && (
                            <>
                                {active !== 'User Management' && (
                                    <Banner title="Broadtrack Operations">
                                        <span>
                                            Manage equipment inventory, review reservation requests, monitor active
                                            transactions,
                                        </span>
                                        <span className="block">and keep track of equipment maintenance.</span>
                                    </Banner>
                                )}
                                <Page onNavigate={setActive} equipment={equipment} bookings={bookings} users={users} />
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
