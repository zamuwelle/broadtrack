import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api-client'
import { paths } from '@/config/paths'
import { ROLES } from '@shared/constants'
import { clearSessionStorage, startSession } from '@/lib/session-storage'

export const isAdmin = (user) => user?.role === ROLES.ADMIN || user?.role === ROLES.SYSADMIN
export const isSysAdmin = (user) => user?.role === ROLES.SYSADMIN
export const isBorrower = (user) => user?.role === ROLES.BORROWER

const getGooglePopupResult = () => {
    const searchParams = new URLSearchParams(globalThis.location.search)
    const token = searchParams.get('token')
    if (token) {
        return { status: 'success', token, path: globalThis.location.pathname }
    }
    if (searchParams.get('tab') === 'register') {
        return {
            status: 'register',
            email: searchParams.get('email') || '',
            firstname: searchParams.get('firstname') || '',
            lastname: searchParams.get('lastname') || '',
            profile_picture: searchParams.get('profile_picture') || ''
        }
    }
    const error = searchParams.get('error')
    return error ? { status: 'error', error } : { status: 'cancel' }
}

const getGooglePopupNonce = () => {
    try {
        return globalThis.sessionStorage?.getItem('google_oauth_popup_nonce') || ''
    } catch {
        return ''
    }
}

const forwardGooglePopupResult = () => {
    const nonce = getGooglePopupNonce()
    if (!nonce || !globalThis.opener) {
        return false
    }
    const result = getGooglePopupResult()
    globalThis.history?.replaceState({}, '', `${globalThis.location.pathname}${globalThis.location.hash}`)
    globalThis.opener.postMessage({ type: 'broadtrack:google-oauth', nonce, ...result }, globalThis.location.origin)
    globalThis.sessionStorage.removeItem('google_oauth_popup_nonce')
    globalThis.close()
    return true
}

const syncTokenFromUrl = () => {
    if (forwardGooglePopupResult()) {
        return
    }

    if (!globalThis.location?.search) {
        return
    }
    const searchParams = new URLSearchParams(globalThis.location.search)
    const token = searchParams.get('token')
    const activeTab = searchParams.get('tab')

    if (token && activeTab !== 'reset') {
        startSession(token)
        searchParams.delete('token')
        const remainingQuery = searchParams.toString() ? `?${searchParams.toString()}` : ''
        const cleanUrl = `${globalThis.location.pathname}${remainingQuery}${globalThis.location.hash}`
        globalThis.history?.replaceState({}, '', cleanUrl)
    }
}

export const initAuthFromUrl = () => {
    syncTokenFromUrl()
}

export const clearAuthSession = (queryClient) => {
    clearSessionStorage()
    queryClient?.setQueryData(['me'], null)
    queryClient?.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'me'
    })
}

export const fetchCurrentUser = async () => {
    if (!globalThis.localStorage?.getItem('auth_token')) {
        return null
    }
    try {
        const response = await api.get('/me')
        return response?.data ?? null
    } catch (error) {
        if (error?.status === 401 || error?.response?.status === 401) {
            return null
        }
        throw error
    }
}

export const useUser = (options = {}) => {
    const hasToken = Boolean(globalThis.localStorage?.getItem('auth_token'))

    return useQuery({
        queryKey: ['me'],
        queryFn: fetchCurrentUser,
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
        clearAuthSession(queryClient)
        navigate(paths.home)
    }
}
