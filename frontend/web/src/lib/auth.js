import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api-client'
import { paths } from '@/config/paths'
import { ROLES } from '@shared/constants'

export const isAdmin = (user) => user?.role === ROLES.ADMIN || user?.role === ROLES.SYSADMIN
export const isSysAdmin = (user) => user?.role === ROLES.SYSADMIN
export const isBorrower = (user) => user?.role === ROLES.BORROWER

const syncTokenFromUrl = () => {
    if (!globalThis.location?.search) {
        return
    }
    const searchParams = new URLSearchParams(globalThis.location.search)
    const token = searchParams.get('token')
    const activeTab = searchParams.get('tab')

    if (token && activeTab !== 'reset') {
        globalThis.localStorage?.setItem('auth_token', token)
        searchParams.delete('token')
        const remainingQuery = searchParams.toString() ? `?${searchParams.toString()}` : ''
        const cleanUrl = `${globalThis.location.pathname}${remainingQuery}${globalThis.location.hash}`
        globalThis.history?.replaceState({}, '', cleanUrl)
    }
}

syncTokenFromUrl()

export const getUser = async () => {
    syncTokenFromUrl()
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
    syncTokenFromUrl()
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
