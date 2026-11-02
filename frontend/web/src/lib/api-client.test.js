import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { api, setUnauthorizedHandler } from '@/lib/api-client'

describe('api-client', () => {
    let originalAdapter

    beforeEach(() => {
        globalThis.localStorage.clear()
        originalAdapter = api.defaults.adapter
        setUnauthorizedHandler(null)
    })

    afterEach(() => {
        api.defaults.adapter = originalAdapter
        setUnauthorizedHandler(null)
        globalThis.localStorage.clear()
    })

    it('adds authorization header when auth_token is present in localStorage', async () => {
        globalThis.localStorage.setItem('auth_token', 'token-123')
        let capturedConfig

        api.defaults.adapter = (config) => {
            capturedConfig = config
            return Promise.resolve({
                data: { status: 'success', data: { ok: true } },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            })
        }

        const res = await api.get('/ping')
        expect(res).toEqual({ status: 'success', data: { ok: true } })
        expect(capturedConfig.headers.Authorization).toBe('Bearer token-123')
    })

    it('does not add authorization header when auth_token is missing', async () => {
        let capturedConfig

        api.defaults.adapter = (config) => {
            capturedConfig = config
            return Promise.resolve({
                data: { status: 'success' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            })
        }

        await api.get('/ping')
        expect(capturedConfig.headers.Authorization).toBeUndefined()
    })

    it('clears auth_token and calls unauthorizedHandler on 401 responses', async () => {
        globalThis.localStorage.setItem('auth_token', 'token-123')
        const onUnauthorized = vi.fn()
        setUnauthorizedHandler(onUnauthorized)

        api.defaults.adapter = (config) => {
            const error = new Error('Unauthorized')
            error.config = config
            error.response = {
                status: 401,
                statusText: 'Unauthorized',
                data: { message: 'Unauthenticated.' },
                headers: {},
                config
            }
            return Promise.reject(error)
        }

        await expect(api.get('/me')).rejects.toMatchObject({
            status: 401,
            message: 'Unauthenticated.'
        })

        expect(globalThis.localStorage.getItem('auth_token')).toBeNull()
        expect(onUnauthorized).toHaveBeenCalledTimes(1)
    })

    it('clears auth_token even if unauthorizedHandler is null', async () => {
        globalThis.localStorage.setItem('auth_token', 'token-123')
        setUnauthorizedHandler(null)

        api.defaults.adapter = (config) => {
            const error = new Error('Unauthorized')
            error.config = config
            error.response = {
                status: 401,
                statusText: 'Unauthorized',
                data: { message: 'Unauthenticated.' },
                headers: {},
                config
            }
            return Promise.reject(error)
        }

        await expect(api.get('/me')).rejects.toMatchObject({ status: 401 })
        expect(globalThis.localStorage.getItem('auth_token')).toBeNull()
    })

    it('does not clear auth_token or call unauthorizedHandler on 500 responses', async () => {
        globalThis.localStorage.setItem('auth_token', 'token-123')
        const onUnauthorized = vi.fn()
        setUnauthorizedHandler(onUnauthorized)

        api.defaults.adapter = (config) => {
            const error = new Error('Server Error')
            error.config = config
            error.response = {
                status: 500,
                statusText: 'Internal Server Error',
                data: { message: 'Something went wrong.' },
                headers: {},
                config
            }
            return Promise.reject(error)
        }

        await expect(api.get('/endpoint')).rejects.toMatchObject({
            status: 500,
            message: 'Something went wrong.'
        })

        expect(globalThis.localStorage.getItem('auth_token')).toBe('token-123')
        expect(onUnauthorized).not.toHaveBeenCalled()
    })
})
