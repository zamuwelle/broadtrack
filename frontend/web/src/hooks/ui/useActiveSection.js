import { useEffect, useState } from 'react'

export const useActiveSection = (pathname) => {
    const [active, setActive] = useState('')
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                }
            },
            { rootMargin: '-50% 0px -50% 0px' }
        )
        for (const section of document.querySelectorAll('section[id]')) {
            observer.observe(section)
        }
        return () => observer.disconnect()
    }, [pathname])
    return active
}
