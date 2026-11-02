import { useCallback, useState } from 'react'
import { useLogout } from '@/lib/auth'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Icon } from '@/components/ui/Icon'

const defaultUser = Object.freeze({})
export const ProfileMenu = ({ user = defaultUser }) => {
    const logout = useLogout()
    const [logoutOpen, setLogoutOpen] = useState(false)

    const openLogout = useCallback(() => {
        setLogoutOpen(true)
    }, [])

    const closeLogout = useCallback(() => {
        setLogoutOpen(false)
    }, [])

    const fullName = user?.full_name ?? ''
    const userEmail = user?.email ?? ''

    return (
        <>
            <div className="w-[264px] h-[151px] bg-gray-100 border border-border-subtle rounded-[8px] p-6 flex flex-col font-['Poppins']">
                <p className="text-[16px] font-medium text-text">{fullName}</p>
                <div className="h-2" />
                <p className="text-[10px] text-subtext">{userEmail}</p>
                <div className="h-1" />
                <div className="border-t border-border-subtle" />
                <div className="pt-3 flex flex-col">
                    <button
                        type="button"
                        onClick={openLogout}
                        className="w-full h-10 rounded-[8px] px-3 flex items-center gap-2 text-text hover:bg-accent-subtle hover:text-red-500 transition-colors">
                        <Icon name="logout" /> Logout
                    </button>
                </div>
            </div>
            <ConfirmModal
                isOpen={logoutOpen}
                onClose={closeLogout}
                onConfirm={logout}
                title="Logout"
                description="You will be returned to the landing page."
                confirmLabel="Logout"
                variant="danger"
            />
        </>
    )
}
