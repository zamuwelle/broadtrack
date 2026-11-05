import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { render, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { api, setUnauthorizedHandler } from '@/lib/api-client'
import { clearAuthSession, fetchCurrentUser, initAuthFromUrl, useLogout } from '@/lib/auth'
import { AppProvider } from '@/app/provider'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('@/lib/api-client', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn()
    },
    setUnauthorizedHandler: vi.fn()
}))

describe('auth session and user fetching', () => {
    beforeEach(() => {
        globalThis.localStorage.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        globalThis.localStorage.clear()
    })

    it('does not mutate localStorage on module import until initAuthFromUrl is called', () => {
        globalThis.history.replaceState({}, '', '/?token=oauth-test-token')
        expect(globalThis.localStorage.getItem('auth_token')).toBeNull()

        initAuthFromUrl()

        expect(globalThis.localStorage.getItem('auth_token')).toBe('oauth-test-token')
        expect(globalThis.location.search).toBe('')
    })

    it('ignores token query param in initAuthFromUrl when tab is reset', () => {
        globalThis.history.replaceState({}, '', '/?token=oauth-test-token&tab=reset')

        initAuthFromUrl()

        expect(globalThis.localStorage.getItem('auth_token')).toBeNull()
        expect(globalThis.location.search).toContain('token=oauth-test-token')
        globalThis.history.replaceState({}, '', '/')
    })
    it('fetchCurrentUser returns null when auth_token is missing without calling api', async () => {
        const user = await fetchCurrentUser()

        expect(user).toBeNull()
        expect(api.get).not.toHaveBeenCalled()
    })

    it('fetchCurrentUser returns user payload on successful api response', async () => {
        globalThis.localStorage.setItem('auth_token', 'valid-token')
        api.get.mockResolvedValueOnce({
            data: { id: 7, firstname: 'Ana', lastname: 'Reyes' }
        })

        const user = await fetchCurrentUser()

        expect(api.get).toHaveBeenCalledWith('/me')
        expect(user).toEqual({ id: 7, firstname: 'Ana', lastname: 'Reyes' })
    })

    it('fetchCurrentUser returns null when api returns 401 error', async () => {
        globalThis.localStorage.setItem('auth_token', 'expired-token')
        const error = new Error('Unauthorized')
        error.status = 401
        api.get.mockRejectedValueOnce(error)

        const user = await fetchCurrentUser()

        expect(user).toBeNull()
    })

    it('fetchCurrentUser returns null when api error response has status 401', async () => {
        globalThis.localStorage.setItem('auth_token', 'expired-token')
        const error = new Error('Unauthorized')
        error.response = { status: 401 }
        api.get.mockRejectedValueOnce(error)

        const user = await fetchCurrentUser()

        expect(user).toBeNull()
    })

    it('fetchCurrentUser rethrows 500 server error', async () => {
        globalThis.localStorage.setItem('auth_token', 'valid-token')
        const serverError = new Error('Database connection failed')
        serverError.status = 500
        api.get.mockRejectedValueOnce(serverError)

        await expect(fetchCurrentUser()).rejects.toMatchObject({ message: 'Database connection failed' })
    })

    it('fetchCurrentUser rethrows network error without status', async () => {
        globalThis.localStorage.setItem('auth_token', 'valid-token')
        const networkError = new Error('Network Error')
        api.get.mockRejectedValueOnce(networkError)

        await expect(fetchCurrentUser()).rejects.toMatchObject({ message: 'Network Error' })
    })

    it('useLogout clears auth session, calls logout endpoint, and navigates home', async () => {
        globalThis.localStorage.setItem('auth_token', 'to-be-cleared')
        api.post.mockResolvedValueOnce({})
        const queryClient = new QueryClient()
        queryClient.setQueryData(['me'], { id: 1 })

        const { result } = renderHook(() => useLogout(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>{children}</MemoryRouter>
                </QueryClientProvider>
            )
        })

        await result.current()

        expect(api.post).toHaveBeenCalledWith('/logout')
        expect(globalThis.localStorage.getItem('auth_token')).toBeNull()
        expect(queryClient.getQueryData(['me'])).toBeNull()
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('AppProvider registers unauthorizedHandler and unregisters on unmount', () => {
        let registeredHandler = null
        setUnauthorizedHandler.mockImplementation((handler) => {
            registeredHandler = handler
        })

        let client
        const CaptureClient = () => {
            const queryClient = useQueryClient()
            useEffect(() => {
                client = queryClient
            }, [queryClient])
            return <div>child content</div>
        }
        const { unmount } = render(
            <AppProvider>
                <CaptureClient />
            </AppProvider>
        )

        expect(setUnauthorizedHandler).toHaveBeenCalled()
        expect(typeof registeredHandler).toBe('function')

        client.setQueryData(['me'], { id: 1 })
        registeredHandler()
        expect(client.getQueryData(['me'])).toBeNull()

        unmount()
        expect(setUnauthorizedHandler).toHaveBeenLastCalledWith(null)
    })
})

it('clears auth token and query cache with clearAuthSession', () => {
    globalThis.localStorage.setItem('auth_token', 'active-token')
    useBookingCartStore.setState({ items: [{ id: 1 }] })
    globalThis.localStorage.setItem('pusherTransportTLS', 'cached')
    globalThis.sessionStorage.setItem('welcome_message', 'Welcome')
    globalThis.sessionStorage.setItem('google_oauth_popup_nonce', 'nonce')
    const queryClient = new QueryClient()
    queryClient.setQueryData(['me'], {
        id: 42,
        email: 'user@student.laverdad.edu.ph'
    })
    queryClient.setQueryData(['equipment'], [{ id: 1 }])

    clearAuthSession(queryClient)
    expect(globalThis.localStorage.getItem('auth_token')).toBeNull()
    expect(useBookingCartStore.getState().items).toEqual([])
    expect(globalThis.localStorage.getItem('broadtrack-booking-cart')).toBeNull()
    expect(globalThis.localStorage.getItem('pusherTransportTLS')).toBeNull()
    expect(globalThis.sessionStorage.length).toBe(0)
    expect(queryClient.getQueryData(['me'])).toBeNull()
    expect(queryClient.getQueryData(['equipment'])).toBeUndefined()
})
