import { render, screen } from '@testing-library/react'
import { Outlet } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { AppRouter } from '@/app/router'
import { useUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({ useUser: vi.fn(), isAdmin: (user) => ['admin', 'sysadmin'].includes(user?.role) }))
vi.mock('@/layouts/PublicLayout', () => ({ Component: () => <Outlet /> }))
vi.mock('@/layouts/BorrowLayout', () => ({ Component: () => <Outlet /> }))
vi.mock('@/layouts/AdminLayout', () => ({ Component: () => <Outlet /> }))
vi.mock('@/features/landing/LandingPage', () => ({ LandingPage: () => <div>Landing page</div> }))
vi.mock('@/features/landing/TermsPage', () => ({ TermsPage: () => <div>Terms page</div> }))
vi.mock('@/features/landing/PrivacyPage', () => ({ PrivacyPage: () => <div>Privacy page</div> }))
vi.mock('@/features/borrow/equipment/EquipmentPage', () => ({ EquipmentPage: () => <div>Equipment page</div> }))
vi.mock('@/features/borrow/calendar/CalendarPage', () => ({ CalendarPage: () => <div>Calendar page</div> }))
vi.mock('@/features/borrow/slips/SlipsPage', () => ({ SlipsPage: () => <div>Slips page</div> }))
vi.mock('@/features/admin/dashboard/DashboardPage', () => ({ DashboardPage: () => <div>Dashboard page</div> }))
vi.mock('@/features/admin/approvals/ApprovalsPage', () => ({ ApprovalsPage: () => <div>Approvals page</div> }))
vi.mock('@/features/admin/inventory/InventoryPage', () => ({ InventoryPage: () => <div>Inventory page</div> }))
vi.mock('@/features/admin/transactions/TransactionsPage', () => ({
    TransactionsPage: () => <div>Transactions page</div>
}))
vi.mock('@/features/admin/users/UsersPage', () => ({ UsersPage: () => <div>Users page</div> }))

const visit = (url, role) => {
    useUser.mockReturnValue({ data: role ? { role } : null, isLoading: false })
    globalThis.history.replaceState({}, '', url)
    render(<AppRouter />)
}

describe('application routes', () => {
    beforeEach(() => useUser.mockReset())
    afterEach(() => globalThis.history.replaceState({}, '', '/'))

    it.each([
        ['/', null, 'Landing page'],
        ['/terms', null, 'Terms page'],
        ['/privacy', null, 'Privacy page'],
        ['/?tab=reset&token=test', null, 'Landing page'],
        ['/equipment', 'borrower', 'Equipment page'],
        ['/calendar', 'borrower', 'Calendar page'],
        ['/slips', 'borrower', 'Slips page'],
        ['/dashboard', 'admin', 'Dashboard page'],
        ['/approvals', 'admin', 'Approvals page'],
        ['/inventory', 'admin', 'Inventory page'],
        ['/transactions', 'admin', 'Transactions page'],
        ['/users', 'sysadmin', 'Users page']
    ])('opens %s for the allowed user', async (path, role, page) => {
        visit(path, role)
        expect(await screen.findByText(page)).toBeInTheDocument()
    })

    it.each([
        ['/dashboard', null, 'Landing page'],
        ['/dashboard', 'borrower', 'Equipment page'],
        ['/equipment', 'admin', 'Dashboard page'],
        ['/users', 'admin', 'Dashboard page'],
        ['/', 'borrower', 'Equipment page'],
        ['/terms', 'borrower', 'Equipment page'],
        ['/privacy', 'admin', 'Dashboard page'],
        ['/', 'sysadmin', 'Dashboard page'],
        ['/?tab=reset&token=test', 'borrower', 'Equipment page'],
        ['/missing', null, 'Landing page']
    ])('redirects %s for %s', async (path, role, page) => {
        visit(path, role)
        expect(await screen.findByText(page)).toBeInTheDocument()
    })
})
