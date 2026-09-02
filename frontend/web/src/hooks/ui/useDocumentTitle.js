import { useEffect } from 'react'

export const useDocumentTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} — Broadtrack` : 'Broadtrack — Streamline Your Equipment Logistics'
    }, [title])
}
