import { useCallback } from 'react'
import { getFullName } from '@shared/util/name'
import { useLogout } from '@/lib/auth'
import { useSetState } from '@shared/hooks/useSetState'
import { ProfileModal } from '@/features/users/components/ProfileModal'
import { LogoutModal } from '@/features/users/components/LogoutModal'
import { Icon } from '@/components/ui/Icon'

const defaultUser = Object.freeze({})
const noop = () => null
const initialMenuState = Object.freeze({
    editOpen: false,
    logoutOpen: false
})

export const ProfileMenu = ({ user = defaultUser, onUpdated = noop }) => {
    const logout = useLogout()
    const [menuState, updateMenuState] = useSetState(initialMenuState)
    const { editOpen, logoutOpen } = menuState

    const openEdit = useCallback(() => {
        updateMenuState({ editOpen: true })
    }, [updateMenuState])

    const closeEdit = useCallback(() => {
        updateMenuState({ editOpen: false })
    }, [updateMenuState])

    const openLogout = useCallback(() => {
        updateMenuState({ logoutOpen: true })
    }, [updateMenuState])

    const closeLogout = useCallback(() => {
        updateMenuState({ logoutOpen: false })
    }, [updateMenuState])

    const fullName = getFullName(user)
    const userEmail = user?.email ?? ''

    return (
        <>
            <div className="w-[264px] h-[191px] bg-gray-100 border border-border-subtle rounded-[8px] p-6 flex flex-col font-['Poppins']">
                <p className="text-[16px] font-medium text-text">{fullName}</p>
                <div className="h-2" />
                <p className="text-[10px] text-subtext">{userEmail}</p>
                <div className="h-1" />
                <div className="border-t border-border-subtle" />
                <div className="pt-3 flex flex-col">
                    <button
                        type="button"
                        onClick={openEdit}
                        className="w-full h-10 rounded-[8px] px-3 flex items-center gap-2 text-text hover:bg-accent-subtle hover:text-primary transition-colors">
                        <Icon name="editProfile" /> Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={openLogout}
                        className="w-full h-10 rounded-[8px] px-3 flex items-center gap-2 text-text hover:bg-accent-subtle hover:text-red-500 transition-colors">
                        <Icon name="logout" /> Logout
                    </button>
                </div>
            </div>
            <ProfileModal isOpen={editOpen} onClose={closeEdit} onUpdated={onUpdated} />
            <LogoutModal isOpen={logoutOpen} onClose={closeLogout} onConfirm={logout} />
        </>
    )
}
