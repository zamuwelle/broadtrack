import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const parseAuthParams = (search) => {
    const params = new URLSearchParams(search)
    const [token, tab, error] = [params.get('token'), params.get('tab'), params.get('error')]
    if (!tab && !error) {
        return null
    }
    return {
        isOpen: true,
        mode: tab || 'login',
        error: error || '',
        data: {
            token: token || '',
            email: params.get('email') || '',
            firstname: params.get('firstname') || '',
            lastname: params.get('lastname') || '',
            profile_picture: params.get('profile_picture') || ''
        }
    }
}

const defaultState = Object.freeze({
    isOpen: false,
    mode: 'login',
    error: '',
    data: {}
})

export const useAuthModal = () => {
    const { pathname, search } = useLocation()
    const [modal, setModal] = useState(() => parseAuthParams(search) || defaultState)

    useEffect(() => {
        const parsed = parseAuthParams(search)
        if (parsed) {
            globalThis.history.replaceState({}, '', pathname)
        }
    }, [pathname, search])

    const openAuth = useCallback((mode = 'login') => {
        setModal({ isOpen: true, mode, error: '', data: {} })
    }, [])

    const closeAuth = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false, error: '', data: {} }))
    }, [])

    return { ...modal, openAuth, closeAuth }
}
