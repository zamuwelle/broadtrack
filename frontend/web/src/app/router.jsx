import { useMemo } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ADMIN_ROLES, BORROWER_ROLES, ROLES } from '@shared/constants'
import { ProtectedRoute } from '@/app/authorization'
import { paths } from '@/config/paths'

const SYSADMIN_ROLES = Object.freeze([ROLES.SYSADMIN])

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
            element: <ProtectedRoute allowedRoles={BORROWER_ROLES} />,
            children: [
                {
                    lazy: () => import('@/layouts/BorrowLayout'),
                    HydrateFallback: () => null,
                    children: [
                        {
                            path: paths.app.borrowEquipment,
                            lazy: () => import('@/routes/borrow/Equipment')
                        },
                        {
                            path: paths.app.borrowCalendar,
                            lazy: () => import('@/routes/borrow/Calendar')
                        },
                        {
                            path: paths.app.borrowSlips,
                            lazy: () => import('@/routes/borrow/Slips')
                        }
                    ]
                }
            ]
        },
        {
            element: <ProtectedRoute allowedRoles={ADMIN_ROLES} />,
            children: [
                {
                    lazy: () => import('@/layouts/AdminLayout'),
                    HydrateFallback: () => null,
                    children: [
                        {
                            path: paths.app.adminDashboard,
                            lazy: () => import('@/routes/admin/Dashboard')
                        },
                        {
                            path: paths.app.adminApprovals,
                            lazy: () => import('@/routes/admin/Approvals')
                        },
                        {
                            path: paths.app.adminInventory,
                            lazy: () => import('@/routes/admin/Inventory')
                        },
                        {
                            path: paths.app.adminTransactions,
                            lazy: () => import('@/routes/admin/Transactions')
                        },
                        {
                            element: <ProtectedRoute allowedRoles={SYSADMIN_ROLES} />,
                            children: [
                                {
                                    path: paths.app.adminUsers,
                                    lazy: () => import('@/routes/admin/Users')
                                }
                            ]
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
