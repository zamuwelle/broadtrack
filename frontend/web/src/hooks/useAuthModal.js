import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default () => {
	const { pathname, search } = useLocation()
	const [modal, setModal] = useState({ isOpen: false, mode: 'login', error: '', data: {} })

	useEffect(() => {
		const params = new URLSearchParams(search)
		const [token, tab, error] = [params.get('token'), params.get('tab'), params.get('error')]
		if (token && tab !== 'reset') {
			localStorage.setItem('auth_token', token)
			sessionStorage.setItem('just_logged_in', '1')
			window.location.href = '/borrow'
			return
		}
		if (tab || error) {
			setModal({
				isOpen: true,
				mode: tab || 'login',
				error: error || '',
				data: { token: token || '', email: params.get('email') || '', firstname: params.get('firstname') || '', lastname: params.get('lastname') || '' }
			})
			window.history.replaceState({}, '', pathname)
		}
	}, [pathname, search])

	const openAuth = (mode = 'login') => setModal({ isOpen: true, mode, error: '', data: {} })

	const closeAuth = () => setModal(prev => ({ ...prev, isOpen: false, error: '', data: {} }))

	return { ...modal, openAuth, closeAuth }
}