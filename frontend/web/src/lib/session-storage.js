import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

export const clearSessionStorage = () => {
    useBookingCartStore.getState().clearCart()
    globalThis.localStorage?.clear()
    globalThis.sessionStorage?.clear()
}

export const startSession = (token) => {
    clearSessionStorage()
    globalThis.localStorage?.setItem('auth_token', token)
}
