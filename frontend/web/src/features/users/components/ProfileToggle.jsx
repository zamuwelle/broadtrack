import { useCallback } from 'react'
import { getFirstName } from '@shared/util/name'
import { Icon } from '@/components/ui/Icon'
import { ProfileMenu } from '@/features/users/components/ProfileMenu'
import { WelcomeToast } from '@/components/ui/Toast'
import { useToggle } from '@/hooks/ui/useToggle'
import { useToast } from '@/hooks/ui/useToast'

const defaultUser = Object.freeze({})
const noop = () => null

export const ProfileToggle = ({ user = defaultUser, onOpen = noop }) => {
    const { open, setOpen, boxRef } = useToggle()
    const toast = useToast()

    const handleToggle = useCallback(() => {
        if (!open && typeof onOpen === 'function') {
            onOpen()
        }
        setOpen(!open)
    }, [open, onOpen, setOpen])

    const handleProfileUpdated = useCallback(() => {
        toast.show('Profile successfully updated!')
    }, [toast])

    const profilePicture = user?.profile_picture ?? null
    const firstName = getFirstName(user)

    return (
        <div className="relative font-['Poppins']" ref={boxRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`h-9 p-1.5 rounded-[8px] flex items-center gap-2 transition-colors ${open ? 'bg-sky-200' : 'bg-background'}`}>
                {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-hover shrink-0" />
                )}
                <span className="hidden lg:inline text-[16px] font-medium text-text min-w-[60px]">{firstName}</span>
                <Icon name="chevron" className={`hidden lg:inline transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2">
                    <ProfileMenu user={user} onUpdated={handleProfileUpdated} />
                </div>
            )}
            <WelcomeToast show={toast.visible} message={toast.message} />
        </div>
    )
}
