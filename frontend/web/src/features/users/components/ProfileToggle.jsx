import { useCallback, useEffect } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'
import { ProfileMenu } from '@/features/users/components/ProfileMenu'
import { useToggle } from '@/hooks/ui/useToggle'
import { useToast } from '@/hooks/ui/useToast'

const defaultUser = Object.freeze({})
const noop = () => null

export const ProfileToggle = ({ user = defaultUser, onOpen = noop }) => {
    const { open, setOpen, boxRef } = useToggle()
    const { show: showToast } = useToast()

    useEffect(() => {
        const welcomeMessage = globalThis.sessionStorage.getItem('welcome_message')
        if (welcomeMessage) {
            globalThis.sessionStorage.removeItem('welcome_message')
            showToast(welcomeMessage, 'welcome')
        }
    }, [showToast])

    const handleToggle = useCallback(() => {
        if (!open && typeof onOpen === 'function') {
            onOpen()
        }
        setOpen((prev) => !prev)
    }, [open, onOpen, setOpen])

    const profilePicture = user?.profile_picture ?? null
    const firstName = user?.firstname ?? ''

    return (
        <div className="relative font-['Poppins']" ref={boxRef}>
            <button
                type="button"
                aria-label={firstName ? `${firstName} profile menu` : 'Profile menu'}
                aria-expanded={open}
                onClick={handleToggle}
                className={cn('h-9 p-1.5 rounded-[8px] flex items-center gap-2 transition-colors', {
                    'bg-sky-200': open,
                    'bg-background': !open
                })}>
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
                <span className="hidden lg:inline text-[16px] font-medium text-text min-w-[60px] capitalize">
                    {firstName}
                </span>
                <Icon name="chevron" className={cn('hidden lg:inline transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2">
                    <ProfileMenu user={user} />
                </div>
            )}
        </div>
    )
}
