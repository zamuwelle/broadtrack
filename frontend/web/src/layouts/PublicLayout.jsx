import { useCallback } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { LandingNavbar } from '@/features/landing/components/nav/LandingNavbar'
import { LandingFooter } from '@/features/landing/components/footer/LandingFooter'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { useAuthModal } from '@/features/auth/components/useAuthModal'

export const Component = () => {
    const { isOpen, mode, error, data, openAuth, closeAuth } = useAuthModal()
    const handleOpenLogin = useCallback(() => openAuth('login'), [openAuth])
    const handleOpenRegister = useCallback(() => openAuth('register'), [openAuth])

    return (
        <div className="bg-bg min-h-screen flex flex-col justify-between">
            <ScrollRestoration />
            <LandingNavbar onOpenLogin={handleOpenLogin} onOpenRegister={handleOpenRegister} />
            <main className="flex-1">
                <Outlet />
            </main>
            <LandingFooter />
            {isOpen ? (
                <AuthModal
                    key={`${mode}-${(data ? data.email : '') || ''}`}
                    isOpen={isOpen}
                    mode={mode}
                    initialError={error}
                    initialData={data}
                    onClose={closeAuth}
                />
            ) : null}
        </div>
    )
}
