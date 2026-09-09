import { Button } from '@/components/ui/Button'
import { XButton } from '@/components/ui/XButton'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    loadingLabel = 'Processing...',
    cancelLabel = 'Cancel',
    isPending = false,
    variant = 'danger',
    icon,
    children,
    maxWidth = 'max-w-[400px]'
}) => {
    useEscapeKey(onClose)

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="Close backdrop"
                className="fixed inset-0 dim-screen cursor-default border-none outline-none"
                onClick={onClose}
            />
            <div
                className={`bg-surface p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xl w-full ${maxWidth} max-h-[90dvh] overflow-y-scroll my-auto relative z-10 flex flex-col items-center text-center font-['Poppins'] gap-4`}>
                <XButton onClick={onClose} className="absolute top-5 right-5" />
                {icon ? <div className="mb-1">{icon}</div> : null}
                <div className="flex flex-col gap-1 w-full px-6 sm:px-8">
                    {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
                    {description ? <p className="text-sm text-slate-500">{description}</p> : null}
                </div>
                {children}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full">
                    <Button
                        variant="ghost"
                        className="flex-1 sm:flex-initial h-10 px-6 cursor-pointer"
                        disabled={isPending}
                        onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant}
                        className="flex-1 sm:flex-initial h-10 px-6 cursor-pointer"
                        disabled={isPending}
                        onClick={onConfirm}>
                        {isPending ? loadingLabel : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
