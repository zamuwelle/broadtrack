import { useCallback, useState } from 'react'

export const useSidebarTab = (sidebarKey, defaultTab) => {
    const storageKey = `sidebar_tab_${sidebarKey}`
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem(storageKey) || defaultTab)

    const setActive = useCallback(
        (tab) => {
            localStorage.setItem(storageKey, tab)
            setActiveTab(tab)
        },
        [storageKey]
    )

    return [activeTab, setActive]
}
