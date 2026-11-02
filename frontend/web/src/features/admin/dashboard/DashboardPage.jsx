import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsCards } from '@/features/admin/dashboard/components/StatsCards'
import { OverdueAlert } from '@/features/admin/dashboard/components/OverdueAlert'
import { ActiveTransactionsCard } from '@/features/admin/dashboard/components/ActiveTransactionsCard'
import { useEquipment } from '@/features/equipment/api/get-equipment'
import { useBookings } from '@/features/bookings/api/get-bookings'
import { getBookingStatus } from '@shared/util/booking'
import { ACTIVE_BOOKING_STATUSES } from '@shared/constants'
import { paths } from '@/config/paths'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

export const DashboardPage = (props) => {
    useDocumentTitle('Admin Dashboard')
    const { onNavigate, equipment: propEquipment, bookings: propBookings } = props
    const navigate = useNavigate()
    const { data: hookEquipment = [] } = useEquipment()
    const { data: hookBookings = [] } = useBookings()
    const equipment = propEquipment ?? hookEquipment
    const bookings = propBookings ?? hookBookings

    const totalInventory = equipment.length
    const pendingApproval = useMemo(
        () => bookings.filter((booking) => getBookingStatus(booking) === 'pending').length,
        [bookings]
    )

    const activeTransaction = useMemo(
        () =>
            bookings.filter((booking) => {
                const status = getBookingStatus(booking)
                return status === 'approved'
            }).length,
        [bookings]
    )

    const inMaintenance = useMemo(() => equipment.filter((item) => item.status === 'maintenance').length, [equipment])

    const overdueBookings = useMemo(() => bookings.filter((booking) => booking.is_overdue), [bookings])

    const activeTransactions = useMemo(
        () => bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(getBookingStatus(booking))),
        [bookings]
    )

    const handleViewDetails = useCallback(() => {
        navigate(`${paths.app.adminTransactions}?category=overdue`)
    }, [navigate])

    const handleGoToApprovals = useCallback(() => {
        if (typeof onNavigate === 'function') {
            onNavigate('Approvals')
        } else {
            navigate(paths.app.adminApprovals)
        }
    }, [navigate, onNavigate])

    return (
        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col gap-4 sm:gap-6 font-['Poppins']">
            <StatsCards
                totalInventory={totalInventory}
                pendingApproval={pendingApproval}
                activeTransaction={activeTransaction}
                inMaintenance={inMaintenance}
            />
            <OverdueAlert
                overdueCount={overdueBookings.length}
                pendingCount={pendingApproval}
                onViewDetails={handleViewDetails}
                onGoToApprovals={handleGoToApprovals}
            />
            <ActiveTransactionsCard transactions={activeTransactions} />
        </div>
    )
}
