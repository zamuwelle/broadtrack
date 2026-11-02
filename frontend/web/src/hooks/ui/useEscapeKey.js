import { useEffect } from 'react'

export const useEscapeKey = (onEscape) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && typeof onEscape === 'function') {
                onEscape()
            }
        }
        globalThis.addEventListener('keydown', handleKeyDown)
        return () => globalThis.removeEventListener('keydown', handleKeyDown)
    }, [onEscape])
}
