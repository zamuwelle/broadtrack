import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ADMIN_ROLES } from '@shared/constants'
import { paths } from '@/config/paths'
import { useUser } from '@/lib/auth'

export const ProtectedRoute = ({ allowedRoles, children }) => {
    const { data: user, isLoading } = useUser()
    const location = useLocation()
    const redirectState = useMemo(() => ({ from: location }), [location])

    if (isLoading) {
        return null
    }

    if (!user) {
        return <Navigate to={paths.home} state={redirectState} replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const homePath = ADMIN_ROLES.includes(user.role) ? paths.app.admin : paths.app.borrow
        return <Navigate to={homePath} replace />
    }

    return children ?? <Outlet />
}
