import { useEffect, useState } from 'react'

export const useScrollDirection = () => {
    const [scroll, setScroll] = useState({ dir: 'up', top: true })
    useEffect(() => {
        let last = globalThis.scrollY
        const onScroll = () => {
            const y = globalThis.scrollY
            setScroll({ dir: y > last ? 'down' : 'up', top: y === 0 })
            last = y
        }
        globalThis.addEventListener('scroll', onScroll)
        return () => globalThis.removeEventListener('scroll', onScroll)
    }, [])
    return { scrollDirection: scroll.dir, isAtTop: scroll.top }
}
