import { useMemo } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ADMIN_ROLES, BORROWER_ROLES, ROLES } from '@shared/constants'
import { ProtectedRoute } from '@/app/authorization'
import { paths } from '@/config/paths'

const SYSADMIN_ROLES = Object.freeze([ROLES.SYSADMIN])
/* oxlint-disable max-lines-per-function -- keep route definitions together */
const createAppRouter = () =>
    createBrowserRouter([
        {
            element: <ProtectedRoute guestOnly />,
            children: [
                {
                    lazy: () => import('@/layouts/PublicLayout'),
                    HydrateFallback: () => null,
                    children: [
                        {
                            path: paths.home,
                            lazy: async () => {
                                const { LandingPage } = await import('@/features/landing/LandingPage')
                                return { Component: LandingPage }
                            }
                        },
                        {
                            path: paths.terms,
                            lazy: async () => {
                                const { TermsPage } = await import('@/features/landing/TermsPage')
                                return { Component: TermsPage }
                            }
                        },
                        {
                            path: paths.privacy,
                            lazy: async () => {
                                const { PrivacyPage } = await import('@/features/landing/PrivacyPage')
                                return { Component: PrivacyPage }
                            }
                        }
                    ]
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
                            lazy: async () => {
                                const { EquipmentPage } = await import('@/features/borrow/equipment/EquipmentPage')
                                return { Component: EquipmentPage }
                            }
                        },
                        {
                            path: paths.app.borrowCalendar,
                            lazy: async () => {
                                const { CalendarPage } = await import('@/features/borrow/calendar/CalendarPage')
                                return { Component: CalendarPage }
                            }
                        },
                        {
                            path: paths.app.borrowSlips,
                            lazy: async () => {
                                const { SlipsPage } = await import('@/features/borrow/slips/SlipsPage')
                                return { Component: SlipsPage }
                            }
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
                            lazy: async () => {
                                const { DashboardPage } = await import('@/features/admin/dashboard/DashboardPage')
                                return { Component: DashboardPage }
                            }
                        },
                        {
                            path: paths.app.adminApprovals,
                            lazy: async () => {
                                const { ApprovalsPage } = await import('@/features/admin/approvals/ApprovalsPage')
                                return { Component: ApprovalsPage }
                            }
                        },
                        {
                            path: paths.app.adminInventory,
                            lazy: async () => {
                                const { InventoryPage } = await import('@/features/admin/inventory/InventoryPage')
                                return { Component: InventoryPage }
                            }
                        },
                        {
                            path: paths.app.adminTransactions,
                            lazy: async () => {
                                const { TransactionsPage } =
                                    await import('@/features/admin/transactions/TransactionsPage')
                                return { Component: TransactionsPage }
                            }
                        },
                        {
                            element: <ProtectedRoute allowedRoles={SYSADMIN_ROLES} />,
                            children: [
                                {
                                    path: paths.app.adminUsers,
                                    lazy: async () => {
                                        const { UsersPage } = await import('@/features/admin/users/UsersPage')
                                        return { Component: UsersPage }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            path: '*',
            element: <Navigate to={paths.home} replace />
        }
    ])

export const AppRouter = () => {
    const router = useMemo(() => createAppRouter(), [])
    return <RouterProvider router={router} />
}
