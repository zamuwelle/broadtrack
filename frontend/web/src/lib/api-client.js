import { createApi } from '@shared/lib/axios'
import { env } from '@/config/env'
import { clearSessionStorage } from '@/lib/session-storage'

let unauthorizedHandler = null

export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler
}

export const api = createApi({
    baseURL: env.API_URL,
    getToken: () => globalThis.localStorage?.getItem('auth_token') ?? null,
    onUnauthorized: () => {
        clearSessionStorage()
        unauthorizedHandler?.()
    }
})
