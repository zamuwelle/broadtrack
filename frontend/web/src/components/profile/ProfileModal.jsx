import { useCallback, useState } from 'react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useUser } from '@/hooks/queries/useUser'
import { AddPictureModal } from '@/components/profile/AddPictureModal'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { ProfilePicture } from '@/components/profile/ProfilePicture'
import { XButton } from '@/components/ui/XButton'

const noop = () => null

export const ProfileModal = ({ isOpen = false, onClose = noop, onUpdated = noop }) => {
    const { data: user } = useUser()
    const [pictureOpen, setPictureOpen] = useState(false)
    const [pendingPicture, setPendingPicture] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const handleClose = useCallback(() => {
        setPendingPicture(null)
        setPreviewUrl(null)
        onClose()
    }, [onClose])

    const handleEscape = useCallback(() => {
        if (!pictureOpen) {
            handleClose()
        }
    }, [pictureOpen, handleClose])

    useEscapeKey(handleEscape)

    const handleSelectPicture = useCallback((file) => {
        setPendingPicture(file)
        setPreviewUrl(URL.createObjectURL(file))
    }, [])

    const handleOpenPicture = useCallback(() => {
        setPictureOpen(true)
    }, [])

    const handleClosePicture = useCallback(() => {
        setPictureOpen(false)
    }, [])

    if (!isOpen) {
        return null
    }

    const userPicture = user?.profile_picture ?? null

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-['Poppins']">
                <button
                    type="button"
                    aria-label="Close dialog"
                    tabIndex={-1}
                    className="fixed inset-0 dim-screen border-none outline-none cursor-default"
                    onClick={handleClose}
                />
                <div className="bg-surface p-6 sm:p-8 rounded-[8px] w-full max-w-[495px] max-h-[90dvh] overflow-y-scroll my-auto relative z-10 flex flex-col">
                    <XButton onClick={handleClose} className="absolute top-5 right-5" />
                    <h3 className="text-[18px] font-normal text-text text-center px-6">Edit Profile</h3>
                    <div className="mt-[26px] flex justify-center">
                        <ProfilePicture picture={previewUrl || userPicture} onCameraClick={handleOpenPicture} />
                    </div>
                    <div className="mt-8 flex-1 flex flex-col items-center">
                        <EditProfileForm onClose={handleClose} onUpdated={onUpdated} pendingPicture={pendingPicture} />
                    </div>
                </div>
            </div>
            <AddPictureModal isOpen={pictureOpen} onClose={handleClosePicture} onSelectPicture={handleSelectPicture} />
        </>
    )
}
