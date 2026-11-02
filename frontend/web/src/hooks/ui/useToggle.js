import { useEffect, useRef, useState } from 'react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

export const useToggle = () => {
    const [open, setOpen] = useState(false)
    const boxRef = useRef(null)

    useEscapeKey(() => setOpen(false))

    useEffect(() => {
        if (!open) {
            return
        }
        const handleDocumentClick = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        globalThis.document.addEventListener('mousedown', handleDocumentClick)
        return () => globalThis.document.removeEventListener('mousedown', handleDocumentClick)
    }, [open])

    return { open, setOpen, boxRef }
}
