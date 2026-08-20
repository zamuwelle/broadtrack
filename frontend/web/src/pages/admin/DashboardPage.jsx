import { useCallback, useMemo, useState } from 'react'
import { StatsCards } from '@/components/admin/dashboard/StatsCards'
import { OverdueAlert } from '@/components/admin/dashboard/OverdueAlert'
import { ActiveTransactionsCard } from '@/components/admin/dashboard/ActiveTransactionsCard'
import { TransactionDetailsModal } from '@/components/admin/transactions/TransactionDetailsModal'
import { getBookingStatus, isBookingOverdue } from '@shared/util/booking'
import { getEquipmentStatus } from '@shared/util/equipment'
import { activeBookingStatuses } from '@shared/data/bookingStatuses'

const defaultList = Object.freeze([])

export const DashboardPage = (props) => {
    const { onNavigate, equipment = defaultList, bookings = defaultList } = props
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
        () => bookings.filter((booking) => activeBookingStatuses.includes(getBookingStatus(booking))),
        [bookings]
    )

    const handleViewDetails = useCallback(() => {
        setSelectedOverdueBooking(overdueBookings[0] || null)
    }, [overdueBookings])

    const handleGoToApprovals = useCallback(() => {
        if (typeof onNavigate === 'function') {
            onNavigate('Approvals')
        }
    }, [onNavigate])

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
