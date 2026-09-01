import { useMemo } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { paths } from '@/config/paths'
import { AppRoot } from '@/app/routes/root'

const getBorrowChildren = () => [
    {
        index: true,
        lazy: async () => {
            const { BorrowIndexRoute } = await import('@/app/routes/app/borrow/index')
            return { Component: BorrowIndexRoute }
        }
    },
    {
        path: 'equipment',
        lazy: async () => {
            const { EquipmentPage } = await import('@/app/routes/app/borrow/Equipment')
            return { Component: EquipmentPage }
        }
    },
    {
        path: 'calendar',
        lazy: async () => {
            const { CalendarPage } = await import('@/app/routes/app/borrow/Calendar')
            return { Component: CalendarPage }
        }
    },
    {
        path: 'slips',
        lazy: async () => {
            const { SlipsPage } = await import('@/app/routes/app/borrow/Slips')
            return { Component: SlipsPage }
        }
    }
]

const getAdminChildren = () => [
    {
        index: true,
        lazy: async () => {
            const { AdminIndexRoute } = await import('@/app/routes/app/admin/index')
            return { Component: AdminIndexRoute }
        }
    },
    {
        path: 'dashboard',
        lazy: async () => {
            const { DashboardPage } = await import('@/app/routes/app/admin/Dashboard')
            return { Component: DashboardPage }
        }
    },
    {
        path: 'approvals',
        lazy: async () => {
            const { ApprovalsPage } = await import('@/app/routes/app/admin/Approvals')
            return { Component: ApprovalsPage }
        }
    },
    {
        path: 'inventory',
        lazy: async () => {
            const { InventoryPage } = await import('@/app/routes/app/admin/Inventory')
            return { Component: InventoryPage }
        }
    },
    {
        path: 'transactions',
        lazy: async () => {
            const { TransactionsPage } = await import('@/app/routes/app/admin/Transactions')
            return { Component: TransactionsPage }
        }
    },
    {
        path: 'users',
        lazy: async () => {
            const { UserManagementPage } = await import('@/app/routes/app/admin/Users')
            return { Component: UserManagementPage }
        }
    }
]

const getAppRoutes = () => [
    {
        path: paths.home,
        lazy: async () => {
            const { LandingRoute } = await import('@/app/routes/Landing')
            return { Component: LandingRoute }
        }
    },
    {
        path: paths.terms,
        lazy: async () => {
            const { TermsRoute } = await import('@/app/routes/Terms')
            return { Component: TermsRoute }
        }
    },
    {
        path: paths.privacy,
        lazy: async () => {
            const { PrivacyRoute } = await import('@/app/routes/Privacy')
            return { Component: PrivacyRoute }
        }
    },
    {
        path: paths.app.borrow,
        lazy: async () => {
            const { BorrowRoute } = await import('@/app/routes/app/Borrow')
            return { Component: BorrowRoute }
        },
        children: getBorrowChildren()
    },
    {
        path: paths.app.admin,
        lazy: async () => {
            const { AdminRoute } = await import('@/app/routes/app/Admin')
            return { Component: AdminRoute }
        },
        children: getAdminChildren()
    },
    {
        path: '*',
        lazy: async () => {
            const { NotFoundRoute } = await import('@/app/routes/NotFound')
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
