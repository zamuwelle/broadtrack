import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api-client'
import { paths } from '@/config/paths'
import { ROLES } from '@shared/constants'

export const isAdmin = (user) => user?.role === ROLES.ADMIN || user?.role === ROLES.SYSADMIN
export const isSysAdmin = (user) => user?.role === ROLES.SYSADMIN
export const isBorrower = (user) => user?.role === ROLES.BORROWER

export const getUser = async () => {
    if (!globalThis.localStorage?.getItem('auth_token')) {
        return null
    }
    try {
        const response = await api.get('/me')
        return response?.data ?? null
    } catch {
        return null
    }
}

export const useUser = (options = {}) => {
    const hasToken = Boolean(globalThis.localStorage?.getItem('auth_token'))

    return useQuery({
        queryKey: ['me'],
        queryFn: getUser,
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        enabled: hasToken && (options.enabled ?? true),
        ...options
    })
}

export const useLogout = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return async () => {
        try {
            await api.post('/logout')
        } catch {
            // ignore network failure on logout
        }
        globalThis.localStorage?.removeItem('auth_token')
        queryClient.setQueryData(['me'], null)
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== 'me'
        })
        navigate(paths.home)
    }
}
