import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuthModal } from '@/hooks/ui/useAuthModal'
import { useUser } from '@/hooks/queries/useUser'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { Toast as WelcomeToast } from '@/components/ui/Toast'
import { getFullName } from '@shared/util/name'
import { Landing } from '@/pages/Landing'

const TermsPage = lazy(async () => {
    const module = await import('@/pages/TermsPage')
    return { default: module.TermsPage }
})
const PrivacyPage = lazy(async () => {
    const module = await import('@/pages/PrivacyPage')
    return { default: module.PrivacyPage }
})
const BorrowPage = lazy(async () => {
    const module = await import('@/pages/BorrowPage')
    return { default: module.BorrowPage }
})
const AdminPage = lazy(async () => {
    const module = await import('@/pages/AdminPage')
    return { default: module.AdminPage }
})

if (globalThis.window) {
    const urlParameters = new URLSearchParams(globalThis.window.location.search)
    const initialToken = urlParameters.get('token')
    const initialTab = urlParameters.get('tab')
    if (initialToken && initialTab !== 'reset') {
        globalThis.localStorage.setItem('auth_token', initialToken)
        urlParameters.delete('token')
        const remainingSearch = urlParameters.toString()
        globalThis.window.history.replaceState(
            {},
            '',
            globalThis.window.location.pathname + (remainingSearch ? `?${remainingSearch}` : '')
        )
    }
}

const useAppWelcome = (authArea) => {
    const [welcome, setWelcome] = useState(false)
    const welcomePending = useRef(false)
    const [welcomeUser, setWelcomeUser] = useState(null)

    const handleReady = useCallback(() => {
        if (welcomePending.current) {
            welcomePending.current = false
            setWelcome(true)
        }
    }, [])

    const handleLoginSuccess = useCallback((loggedInUser) => {
        setWelcomeUser(loggedInUser)
        welcomePending.current = true
    }, [])

    useEffect(() => {
        if (!welcome) {
            return
        }
        const timer = setTimeout(() => {
            setWelcome(false)
            setWelcomeUser(null)
        }, 3000)
        return () => clearTimeout(timer)
    }, [welcome])

    const showWelcome = Boolean(welcome && authArea)

    return {
        showWelcome,
        welcomeUser,
        handleReady,
        handleLoginSuccess
    }
}

const useAppRoutes = (authed, isAdmin, homePath, handleReady) => {
    const landingElement = useMemo(
        () => (authed ? <Navigate to={homePath} replace /> : <Landing />),
        [authed, homePath]
    )

    const termsElement = useMemo(
        () => (authed ? <Navigate to={homePath} replace /> : <TermsPage />),
        [authed, homePath]
    )

    const privacyElement = useMemo(
        () => (authed ? <Navigate to={homePath} replace /> : <PrivacyPage />),
        [authed, homePath]
    )

    const borrowElement = useMemo(() => {
        if (!authed) {
            return <Navigate to="/" replace />
        }
        if (isAdmin) {
            return <Navigate to="/admin" replace />
        }
        return <BorrowPage onReady={handleReady} />
    }, [authed, isAdmin, handleReady])

    const adminElement = useMemo(() => {
        if (!authed) {
            return <Navigate to="/" replace />
        }
        if (!isAdmin) {
            return <Navigate to="/borrow" replace />
        }
        return <AdminPage onReady={handleReady} />
    }, [authed, isAdmin, handleReady])

    const catchAllElement = useMemo(() => <Navigate to="/" replace />, [])

    return {
        landingElement,
        termsElement,
        privacyElement,
        borrowElement,
        adminElement,
        catchAllElement
    }
}

export const App = () => {
    const { pathname } = useLocation()
    const { isOpen, mode, error, data, openAuth, closeAuth } = useAuthModal()
    const hasToken = Boolean(globalThis.localStorage) && Boolean(globalThis.localStorage.getItem('auth_token'))
    const authArea = pathname.startsWith('/borrow') || pathname.startsWith('/admin')
    const userOptions = useMemo(() => Object.freeze({ enabled: authArea || hasToken }), [authArea, hasToken])
    const { data: user, isLoading } = useUser(userOptions)
    const authed = Boolean(hasToken && user)
    const userRole = user ? user.role : ''
    const isAdmin = userRole === 'admin' || userRole === 'sysadmin'
    const homePath = isAdmin ? '/admin' : '/borrow'

    const { showWelcome, welcomeUser, handleReady, handleLoginSuccess } = useAppWelcome(authArea)

    const handleOpenLogin = useCallback(() => openAuth('login'), [openAuth])
    const handleOpenRegister = useCallback(() => openAuth('register'), [openAuth])

    useEffect(() => {
        if (globalThis.window) {
            globalThis.window.scrollTo(0, 0)
        }
    }, [pathname])

    const routes = useAppRoutes(authed, isAdmin, homePath, handleReady)

    if (isLoading) {
        return null
    }

    const welcomeMessage = `Welcome, ${getFullName(welcomeUser || user)}!`

    return (
        <>
            {!authArea && !authed && (
                <LandingNavbar onOpenLogin={handleOpenLogin} onOpenRegister={handleOpenRegister} />
            )}
            <WelcomeToast show={showWelcome} message={welcomeMessage} color="var(--color-toast-welcome)" />
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={routes.landingElement} />
                    <Route path="/terms" element={routes.termsElement} />
                    <Route path="/privacy" element={routes.privacyElement} />
                    <Route path="/borrow" element={routes.borrowElement} />
                    <Route path="/admin" element={routes.adminElement} />
                    <Route path="*" element={routes.catchAllElement} />
                </Routes>
            </Suspense>
            {isOpen && (
                <AuthModal
                    key={`${mode}-${(data ? data.email : '') || ''}`}
                    isOpen={isOpen}
                    mode={mode}
                    initialError={error}
                    initialData={data}
                    onClose={closeAuth}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    )
}
