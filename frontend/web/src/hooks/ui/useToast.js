import { useCallback, useEffect } from 'react'
import { useSetState } from '@shared/hooks/useSetState'

export const useToast = (duration = 3000) => {
    const [toastState, updateToastState] = useSetState({
        message: '',
        type: 'success',
        visible: false
    })
    const { message, type, visible } = toastState

    const hide = useCallback(() => {
        updateToastState({ visible: false })
    }, [updateToastState])

    const show = useCallback(
        (nextMessage, nextType = 'success') => {
            updateToastState({
                message: nextMessage,
                type: nextType,
                visible: true
            })
        },
        [updateToastState]
    )

    useEffect(() => {
        if (toastState.visible) {
            const timer = setTimeout(hide, duration)
            return () => clearTimeout(timer)
        }
    }, [toastState, duration, hide])

    return { message, type, visible, show, hide }
}
