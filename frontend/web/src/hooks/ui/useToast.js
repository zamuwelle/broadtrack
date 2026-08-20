import { useCallback, useEffect, useRef } from 'react'
import { useSetState } from '@shared/hooks/useSetState'

export const useToast = (duration = 3000) => {
    const [toastState, updateToastState] = useSetState({
        message: '',
        type: 'success',
        visible: false
    })
    const { message, type, visible } = toastState
    const timer = useRef(null)

    const show = useCallback(
        (nextMessage, nextType = 'success') => {
            updateToastState({
                message: nextMessage,
                type: nextType,
                visible: true
            })
            clearTimeout(timer.current)
            timer.current = setTimeout(() => updateToastState({ visible: false }), duration)
        },
        [duration, updateToastState]
    )

    useEffect(() => () => clearTimeout(timer.current), [])

    return { message, type, visible, show }
}
