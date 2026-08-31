import { useMemo } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { paths } from '@/config/paths'
import { AppRoot } from '@/app/routes/root'

const getBorrowChildren = () => [
    {
        index: true,
        lazy: async () => {
            const { BorrowIndexRoute } = await import('@/app/routes/app/borrow/borrow-index')
            return { Component: BorrowIndexRoute }
        }
    },
    {
        path: 'equipment',
        lazy: async () => {
            const { EquipmentPage } = await import('@/app/routes/app/borrow/equipment')
            return { Component: EquipmentPage }
        }
    },
    {
        path: 'calendar',
        lazy: async () => {
            const { CalendarPage } = await import('@/app/routes/app/borrow/calendar')
            return { Component: CalendarPage }
        }
    },
    {
        path: 'slips',
        lazy: async () => {
            const { SlipsPage } = await import('@/app/routes/app/borrow/slips')
            return { Component: SlipsPage }
        }
    }
]

const getAdminChildren = () => [
    {
        index: true,
        lazy: async () => {
            const { AdminIndexRoute } = await import('@/app/routes/app/admin/admin-index')
            return { Component: AdminIndexRoute }
        }
    },
    {
        path: 'dashboard',
        lazy: async () => {
            const { DashboardPage } = await import('@/app/routes/app/admin/dashboard')
            return { Component: DashboardPage }
        }
    },
    {
        path: 'approvals',
        lazy: async () => {
            const { ApprovalsPage } = await import('@/app/routes/app/admin/approvals')
            return { Component: ApprovalsPage }
        }
    },
    {
        path: 'inventory',
        lazy: async () => {
            const { InventoryPage } = await import('@/app/routes/app/admin/inventory')
            return { Component: InventoryPage }
        }
    },
    {
        path: 'transactions',
        lazy: async () => {
            const { TransactionsPage } = await import('@/app/routes/app/admin/transactions')
            return { Component: TransactionsPage }
        }
    },
    {
        path: 'users',
        lazy: async () => {
            const { UserManagementPage } = await import('@/app/routes/app/admin/users')
            return { Component: UserManagementPage }
        }
    }
]

const getAppRoutes = () => [
    {
        path: paths.home,
        lazy: async () => {
            const { LandingRoute } = await import('@/app/routes/landing')
            return { Component: LandingRoute }
        }
    },
    {
        path: paths.terms,
        lazy: async () => {
            const { TermsRoute } = await import('@/app/routes/terms')
            return { Component: TermsRoute }
        }
    },
    {
        path: paths.privacy,
        lazy: async () => {
            const { PrivacyRoute } = await import('@/app/routes/privacy')
            return { Component: PrivacyRoute }
        }
    },
    {
        path: paths.app.borrow,
        lazy: async () => {
            const { BorrowRoute } = await import('@/app/routes/app/borrow')
            return { Component: BorrowRoute }
        },
        children: getBorrowChildren()
    },
    {
        path: paths.app.admin,
        lazy: async () => {
            const { AdminRoute } = await import('@/app/routes/app/admin')
            return { Component: AdminRoute }
        },
        children: getAdminChildren()
    },
    {
        path: '*',
        lazy: async () => {
            const { NotFoundRoute } = await import('@/app/routes/not-found')
            return { Component: NotFoundRoute }
        }
    }
]

const createAppRouter = () =>
    createBrowserRouter([
        {
            element: <AppRoot />,
            HydrateFallback: () => null,
            children: getAppRoutes()
        }
    ])

export const AppRouter = () => {
    const router = useMemo(() => createAppRouter(), [])
    return <RouterProvider router={router} />
}
