import { useEffect, useState } from 'react'

export const useScrollDirection = () => {
    const [scroll, setScroll] = useState({ dir: 'up', top: true })
    useEffect(() => {
        let last = globalThis.scrollY
        const onScroll = () => {
            const y = globalThis.scrollY
            const dir = y > last ? 'down' : 'up'
            const top = y === 0
            last = y
            setScroll((prev) => (prev.dir === dir && prev.top === top ? prev : { dir, top }))
        }
        globalThis.addEventListener('scroll', onScroll)
        return () => globalThis.removeEventListener('scroll', onScroll)
    }, [])
    return { scrollDirection: scroll.dir, isAtTop: scroll.top }
}
