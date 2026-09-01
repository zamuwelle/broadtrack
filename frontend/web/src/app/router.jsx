import { useMemo } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ADMIN_ROLES, BORROWER_ROLES } from '@shared/constants'
import { ProtectedRoute } from '@/app/authorization'
import { paths } from '@/config/paths'

const createAppRouter = () =>
    createBrowserRouter([
        {
            lazy: () => import('@/layouts/PublicLayout'),
            HydrateFallback: () => null,
            children: [
                {
                    path: paths.home,
                    lazy: () => import('@/routes/Landing')
                },
                {
                    path: paths.terms,
                    lazy: () => import('@/routes/Terms')
                },
                {
                    path: paths.privacy,
                    lazy: () => import('@/routes/Privacy')
                }
            ]
        },
        {
            path: paths.app.borrow,
            element: <ProtectedRoute allowedRoles={BORROWER_ROLES} />,
            children: [
                {
                    lazy: () => import('@/layouts/BorrowLayout'),
                    HydrateFallback: () => null,
                    children: [
                        {
                            index: true,
                            lazy: () => import('@/routes/borrow/Equipment')
                        },
                        {
                            path: 'equipment',
                            lazy: () => import('@/routes/borrow/Equipment')
                        },
                        {
                            path: 'calendar',
                            lazy: () => import('@/routes/borrow/Calendar')
                        },
                        {
                            path: 'slips',
                            lazy: () => import('@/routes/borrow/Slips')
                        }
                    ]
                }
            ]
        },
        {
            path: paths.app.admin,
            element: <ProtectedRoute allowedRoles={ADMIN_ROLES} />,
            children: [
                {
                    lazy: () => import('@/layouts/AdminLayout'),
                    HydrateFallback: () => null,
                    children: [
                        {
                            index: true,
                            lazy: () => import('@/routes/admin/Dashboard')
                        },
                        {
                            path: 'dashboard',
                            lazy: () => import('@/routes/admin/Dashboard')
                        },
                        {
                            path: 'approvals',
                            lazy: () => import('@/routes/admin/Approvals')
                        },
                        {
                            path: 'inventory',
                            lazy: () => import('@/routes/admin/Inventory')
                        },
                        {
                            path: 'transactions',
                            lazy: () => import('@/routes/admin/Transactions')
                        },
                        {
                            path: 'users',
                            lazy: () => import('@/routes/admin/Users')
                        }
                    ]
                }
            ]
        },
        {
            path: '*',
            lazy: () => import('@/routes/NotFound')
        }
    ])

export const AppRouter = () => {
    const router = useMemo(() => createAppRouter(), [])
    return <RouterProvider router={router} />
}
