import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ADMIN_ROLES } from '@shared/constants'
import { paths } from '@/config/paths'
import { isAdmin, useUser } from '@/lib/auth'

export const ProtectedRoute = ({ allowedRoles, guestOnly = false, children }) => {
    const { data: user, isLoading } = useUser()
    const location = useLocation()
    const redirectState = useMemo(() => ({ from: location }), [location])

    if (isLoading) {
        return null
    }

    if (guestOnly) {
        if (user) {
            return <Navigate to={isAdmin(user) ? paths.app.adminDashboard : paths.app.borrowEquipment} replace />
        }
        return children ?? <Outlet />
    }

    if (!user) {
        return <Navigate to={paths.home} state={redirectState} replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const homePath = ADMIN_ROLES.includes(user.role) ? paths.app.adminDashboard : paths.app.borrowEquipment
        return <Navigate to={homePath} replace />
    }

    return children ?? <Outlet />
}
