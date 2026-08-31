import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatsCards } from '@/features/admin/dashboard/components/StatsCards'
import { OverdueAlert } from '@/features/admin/dashboard/components/OverdueAlert'
import { ActiveTransactionsCard } from '@/features/admin/transactions/components/ActiveTransactionsCard'
import { TransactionDetailsModal } from '@/features/admin/transactions/components/TransactionDetailsModal'
import { useEquipment } from '@/api/equipment/get-equipment'
import { useBookings } from '@/api/bookings/get-bookings'
import { getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { getEquipmentStatus } from '@shared/util/equipment'
import { ACTIVE_BOOKING_STATUSES } from '@shared/constants'
import { paths } from '@/config/paths'

export const DashboardPage = (props) => {
    const { onNavigate, equipment: propEquipment, bookings: propBookings } = props
    const navigate = useNavigate()
    const { data: hookEquipment = [] } = useEquipment()
    const { data: hookBookings = [] } = useBookings()
    const equipment = propEquipment ?? hookEquipment
    const bookings = propBookings ?? hookBookings

    const [selectedOverdueBooking, setSelectedOverdueBooking] = useState(null)

    const totalInventory = equipment.length
    const pendingApproval = useMemo(
        () => bookings.filter((booking) => getBookingStatus(booking) === 'pending').length,
        [bookings]
    )

    const activeTransaction = useMemo(
        () =>
            bookings.filter((booking) => {
                const status = getBookingStatus(booking)
                return status === 'approved' || status === 'released'
            }).length,
        [bookings]
    )

    const inMaintenance = useMemo(
        () => equipment.filter((item) => getEquipmentStatus(item) === 'maintenance').length,
        [equipment]
    )

    const overdueBookings = useMemo(() => bookings.filter((booking) => isBookingOverdue(booking)), [bookings])

    const activeTransactions = useMemo(
        () => bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(getBookingStatus(booking))),
        [bookings]
    )

    const handleViewDetails = useCallback(() => {
        setSelectedOverdueBooking(overdueBookings[0] || null)
    }, [overdueBookings])

    const handleGoToApprovals = useCallback(() => {
        if (typeof onNavigate === 'function') {
            onNavigate('Approvals')
        } else {
            navigate(paths.app.adminApprovals)
        }
    }, [navigate, onNavigate])

    const handleCloseModal = useCallback(() => {
        setSelectedOverdueBooking(null)
    }, [])

    const isModalOpen = Boolean(selectedOverdueBooking)

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

            <TransactionDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} booking={selectedOverdueBooking} />
        </div>
    )
}
