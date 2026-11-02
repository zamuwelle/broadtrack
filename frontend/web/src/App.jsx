import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthModal from '@/hooks/useAuthModal'
import useUser from '@/hooks/useUser'
import HomeNavbar from '@/components/HomeNavbar'
import AuthModal from '@/components/AuthModal'
import WelcomeToast from '@/components/toast/WelcomeToast'
import { getFullName } from '@shared/util/name'
import Landing from '@/pages/Landing'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import BorrowPage from '@/pages/BorrowPage'
import AdminPage from '@/pages/AdminPage'

export default () => {
	const { pathname } = useLocation()
	const { isOpen, mode, error, data, openAuth, closeAuth } = useAuthModal()
	const { data: user, isLoading, isError, error: meError } = useUser()
	const authed = !!localStorage.getItem('auth_token')
	const authArea = pathname.startsWith('/borrow') || pathname.startsWith('/admin')
	const booted = !authed || !isLoading
	const homePath = user?.role === 'admin' ? '/admin' : '/borrow'
	const [welcome, setWelcome] = useState(false)
	const [loginFlag] = useState(() => sessionStorage.getItem('just_logged_in'))

	useEffect(() => { window.scrollTo(0, 0) }, [pathname])

	useEffect(() => {
		if (loginFlag && user) {
			sessionStorage.removeItem('just_logged_in')
			setWelcome(true)
		}
	}, [loginFlag, user])

	useEffect(() => {
		if (!welcome) return
		const timer = setTimeout(() => setWelcome(false), 3000)
		return () => clearTimeout(timer)
	}, [welcome])

	useEffect(() => {
		if (!authArea) setWelcome(false)
	}, [authArea])

	useEffect(() => {
		if (isError && meError?.status === 401) {
			localStorage.removeItem('auth_token')
			sessionStorage.removeItem('just_logged_in')
		}
	}, [isError, meError])

	if (!booted) return null

	return (
		<>
			{!authArea && <HomeNavbar onOpenLogin={() => openAuth('login')} onOpenRegister={() => openAuth('register')} />}
			<WelcomeToast show={welcome} message={`Welcome, ${getFullName(user)}!`} />
			<Routes>
				<Route path="/" element={authed ? <Navigate to={homePath} replace /> : <Landing onOpenLogin={() => openAuth('login')} />} />
				<Route path="/terms" element={authed ? <Navigate to={homePath} replace /> : <TermsPage />} />
				<Route path="/privacy" element={authed ? <Navigate to={homePath} replace /> : <PrivacyPage />} />
				<Route path="/borrow" element={authed ? (user?.role === 'admin' ? <Navigate to="/admin" replace /> : <BorrowPage />) : <Navigate to="/" replace />} />
				<Route path="/admin" element={authed ? (user?.role === 'admin' ? <AdminPage /> : <Navigate to="/borrow" replace />) : <Navigate to="/" replace />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			<AuthModal
				key={`${mode}-${data?.email || ''}`}
				isOpen={isOpen}
				mode={mode}
				initialError={error}
				initialData={data}
				onClose={closeAuth}
			/>
		</>
	)
}
