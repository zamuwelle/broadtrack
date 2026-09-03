import { useEffect } from 'react'

let globalUnreadCount = 0
let currentTitle = ''

const updateTitle = () => {
    if (!globalThis.document) {
        return
    }
    const prefix = globalUnreadCount > 0 ? `🔴 (${globalUnreadCount}) ` : ''
    const baseTitle = currentTitle ? `${currentTitle} — Broadtrack` : 'Broadtrack — Streamline Your Equipment Logistics'
    globalThis.document.title = `${prefix}${baseTitle}`
}

export const setGlobalUnreadCount = (count) => {
    globalUnreadCount = Math.max(0, count || 0)
    updateTitle()
}

export const useDocumentTitle = (title, count) => {
    useEffect(() => {
        if (typeof count === 'number') {
            globalUnreadCount = Math.max(0, count)
        }
        currentTitle = title || ''
        updateTitle()
    }, [title, count])
}
