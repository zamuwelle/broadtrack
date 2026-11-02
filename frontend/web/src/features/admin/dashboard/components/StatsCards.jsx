import { StatCard } from '@/features/admin/dashboard/components/StatCard'

const cardsConfig = Object.freeze([
    { key: 'inventory', title: 'TOTAL INVENTORY', unit: 'items', isAmber: false },
    {
        key: 'pending',
        title: 'PENDING APPROVAL',
        unit: 'action required',
        isAmber: true
    },
    {
        key: 'active',
        title: 'ACTIVE TRANSACTION',
        unit: 'action required',
        isAmber: true
    },
    {
        key: 'maintenance',
        title: 'IN MAINTENANCE',
        unit: 'servicing',
        isAmber: false
    }
])

export const StatsCards = ({ totalInventory = 0, pendingApproval = 0, activeTransaction = 0, inMaintenance = 0 }) => {
    const values = {
        inventory: totalInventory,
        pending: pendingApproval,
        active: activeTransaction,
        maintenance: inMaintenance
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {cardsConfig.map(({ key, title, unit, isAmber }) => (
                <StatCard key={key} title={title} value={values[key] ?? 0} unit={unit} isAmber={isAmber} />
            ))}
        </div>
    )
}
