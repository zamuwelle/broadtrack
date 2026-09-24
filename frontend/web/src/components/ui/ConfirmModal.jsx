import { useEffect, useId, useRef } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/Button'
import { XButton } from '@/components/ui/XButton'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

const getDialogFocusableElements = (dialog) =>
    [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((element) => {
        const isDisabled = element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true'
        const isHidden = element.closest('[hidden], [aria-hidden="true"], [inert]')
        const style = globalThis.getComputedStyle(element)
        return (
            element.tabIndex >= 0 &&
            !isDisabled &&
            !isHidden &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.getClientRects().length > 0
        )
    })

const trapDialogTab = (event, dialog) => {
    if (event.key !== 'Tab') {
        return
    }
    const focusableElements = getDialogFocusableElements(dialog)
    if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
    }
    const first = focusableElements[0]
    const last = focusableElements.at(-1)
    const { activeElement } = document
    const activeIsOutside = !dialog.contains(activeElement)
    const shouldWrap = event.shiftKey
        ? activeIsOutside || activeElement === first
        : activeIsOutside || activeElement === last
    if (shouldWrap) {
        event.preventDefault()
        const focusTarget = event.shiftKey ? last : first
        focusTarget.focus()
    }
}

const useDialogFocus = (isOpen, dialogRef) => {
    const triggerRef = useRef(null)

    useEffect(() => {
        if (!isOpen || !dialogRef.current) {
            return
        }

        const dialog = dialogRef.current
        const trigger = document.activeElement
        triggerRef.current = trigger instanceof HTMLElement ? trigger : null
        const focusableElements = getDialogFocusableElements(dialog)
        const initialFocusElement = focusableElements[0] ?? dialog
        initialFocusElement.focus({ preventScroll: true })
        const handleTab = (event) => trapDialogTab(event, dialog)
        document.addEventListener('keydown', handleTab)

        return () => {
            document.removeEventListener('keydown', handleTab)
            const triggerElement = triggerRef.current
            const canRestoreFocus =
                triggerElement?.isConnected &&
                !triggerElement.matches(':disabled') &&
                !triggerElement.closest('[hidden], [aria-hidden="true"], [inert]')
            if (canRestoreFocus) {
                triggerElement.focus({ preventScroll: true })
            }
            triggerRef.current = null
        }
    }, [isOpen, dialogRef])
}

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
    const dialogRef = useRef(null)
    const titleId = useId()
    const descriptionId = useId()

    useEscapeKey(isOpen ? onClose : null)
    useDialogFocus(isOpen, dialogRef)

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="Close backdrop"
                tabIndex={-1}
                className="fixed inset-0 dim-screen cursor-default border-none outline-none"
                onClick={onClose}
            />
            <dialog
                open
                ref={dialogRef}
                aria-modal="true"
                aria-labelledby={title ? titleId : null}
                aria-describedby={description ? descriptionId : null}
                tabIndex={-1}
                className={cn(
                    "bg-surface p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xl w-full max-h-[90dvh] overflow-y-scroll my-auto relative z-10 flex flex-col items-center text-center font-['Poppins'] gap-4",
                    maxWidth
                )}>
                <XButton onClick={onClose} className="absolute top-5 right-5" />
                {icon ? <div className="mb-1">{icon}</div> : null}
                <div className="flex flex-col gap-1 w-full px-6 sm:px-8">
                    {title ? (
                        <h3 id={titleId} className="text-lg font-semibold text-slate-900">
                            {title}
                        </h3>
                    ) : null}
                    {description ? (
                        <p id={descriptionId} className="text-sm text-slate-500">
                            {description}
                        </p>
                    ) : null}
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
            </dialog>
        </div>
    )
}
