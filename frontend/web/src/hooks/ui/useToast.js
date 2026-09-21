import { useCallback } from 'react'
import { create } from 'zustand'

const useToastStore = create(() => ({
    message: '',
    type: 'success',
    visible: false
}))

let activeTimer = null

const clearActiveTimer = () => {
    if (activeTimer) {
        clearTimeout(activeTimer)
        activeTimer = null
    }
}

export const useToast = (duration = 3000) => {
    const message = useToastStore((state) => state.message)
    const type = useToastStore((state) => state.type)
    const visible = useToastStore((state) => state.visible)

    const hide = useCallback(() => {
        clearActiveTimer()
        useToastStore.setState({ visible: false })
    }, [])

    const show = useCallback(
        (nextMessage, nextType = 'success') => {
            clearActiveTimer()
            useToastStore.setState({
                message: nextMessage,
                type: nextType,
                visible: true
            })
            activeTimer = setTimeout(() => {
                useToastStore.setState({ visible: false })
                activeTimer = null
            }, duration)
        },
        [duration]
    )

    return { message, type, visible, show, hide }
}
