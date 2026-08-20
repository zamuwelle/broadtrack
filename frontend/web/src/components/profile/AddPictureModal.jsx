import { useCallback, useRef, useState } from 'react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { Icon } from '@/components/ui/Icon'
import { XButton } from '@/components/ui/XButton'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const noop = () => null

export const AddPictureModal = ({ isOpen = false, onClose = noop, onSelectPicture = noop }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const fileInputRef = useRef(null)

    useEscapeKey(onClose)

    const handleFileSelect = useCallback(
        (event) => {
            const { files } = event.target
            const selectedFile = files ? files[0] : null
            if (!selectedFile) {
                return
            }
            if (!selectedFile.type.startsWith('image/')) {
                setErrorMessage('Please select a valid image file.')
                return
            }
            if (selectedFile.size > MAX_IMAGE_BYTES) {
                setErrorMessage('Image size must be less than 2MB.')
                return
            }
            setErrorMessage('')
            onSelectPicture(selectedFile)
            event.target.value = ''
            onClose()
        },
        [onClose, onSelectPicture]
    )

    const handleTriggerUpload = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }, [])

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-['Poppins']">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                className="fixed inset-0 dim-screen border-none outline-none cursor-default"
                onClick={onClose}
            />
            <div className="bg-surface p-6 sm:p-8 rounded-[8px] w-full max-w-[381px] max-h-[90dvh] overflow-y-scroll my-auto relative z-10 flex flex-col">
                <XButton onClick={onClose} className="absolute top-5 right-5" />
                <h3 className="text-[18px] font-normal text-text text-center px-6">Add profile picture</h3>
                <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="mt-[42px] w-full h-[44px] bg-gray-100 rounded-[8px] flex items-center justify-center gap-2 transition-colors hover:bg-accent-subtle cursor-pointer">
                    <Icon name="picture" />
                    <span className="text-[16px] font-normal text-muted">Upload from Device</span>
                </button>
                {errorMessage ? <p className="text-red-500 text-xs mt-2 text-center">{errorMessage}</p> : null}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>
        </div>
    )
}
