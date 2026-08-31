import { useCallback, useMemo } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { useAuthModal } from '@/features/auth/components/useAuthModal'

export const AppRoot = () => {
    const { isOpen, mode, error, data, openAuth, closeAuth } = useAuthModal()
    const handleOpenLogin = useCallback(() => openAuth('login'), [openAuth])
    const handleOpenRegister = useCallback(() => openAuth('register'), [openAuth])
    const outletContext = useMemo(
        () => ({
            onOpenLogin: handleOpenLogin,
            onOpenRegister: handleOpenRegister
        }),
        [handleOpenLogin, handleOpenRegister]
    )

    return (
        <>
            <ScrollRestoration />
            <Outlet context={outletContext} />
            {isOpen && (
                <AuthModal
                    key={`${mode}-${(data ? data.email : '') || ''}`}
                    isOpen={isOpen}
                    mode={mode}
                    initialError={error}
                    initialData={data}
                    onClose={closeAuth}
                />
            )}
        </>
    )
}
