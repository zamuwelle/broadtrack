import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { paths } from '@/config/paths'
import { useUser } from '@/lib/auth'

const defaultAllowedRoles = Object.freeze([])

export const ProtectedRoute = ({ allowedRoles = defaultAllowedRoles, children }) => {
    const { data: user, isLoading } = useUser()
    const location = useLocation()
    const redirectState = useMemo(() => ({ from: location }), [location])

    if (isLoading) {
        return null
    }

    if (!user) {
        return <Navigate to={paths.home} state={redirectState} replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const homePath = user.role === 'admin' || user.role === 'sysadmin' ? paths.app.admin : paths.app.borrow
        return <Navigate to={homePath} replace />
    }

    return children
}

export const Authorization = ({ allowedRoles = defaultAllowedRoles, forbiddenFallback = null, children }) => {
    const { data: user } = useUser()
    const hasAccess = Boolean(user && allowedRoles.includes(user.role))

    if (!hasAccess) {
        return forbiddenFallback
    }

    return children
}
