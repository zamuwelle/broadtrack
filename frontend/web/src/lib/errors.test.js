import { expect, it } from 'vite-plus/test'
import { isLocalError, isServerError } from '@/lib/errors'

it('distinguishes network and server failures from HTTP validation errors', () => {
    expect(isServerError(new Error('Network Error'))).toBe(true)
    expect(isServerError({ status: 500 })).toBe(true)
    expect(isServerError({ status: 503 })).toBe(true)
    expect(isServerError({ status: 422 })).toBe(false)
    expect(isServerError({ status: 429 })).toBe(false)
    expect(isServerError({ code: 'ERR_CANCELED', isAxiosError: true })).toBe(false)
    expect(isServerError(new Error('Unrelated error'))).toBe(false)
    expect(isServerError({ code: 'ECONNABORTED', isAxiosError: true })).toBe(true)
    expect(isLocalError({ code: 'ERR_CANCELED' })).toBe(false)
    expect(isLocalError({ cause: { code: 'ERR_CANCELED' } })).toBe(false)
    expect(isLocalError({ status: 422 })).toBe(true)
})
