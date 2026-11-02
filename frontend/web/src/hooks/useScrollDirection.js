import { useState, useEffect } from 'react'

export default () => {
	const [scroll, setScroll] = useState({ dir: 'up', top: true })
	useEffect(() => {
		let last = window.scrollY
		const onScroll = () => {
			const y = window.scrollY
			setScroll({ dir: y > last ? 'down' : 'up', top: y === 0 })
			last = y
		}
		window.addEventListener('scroll', onScroll)
		return () => window.removeEventListener('scroll', onScroll)
	}, [])
	return { scrollDirection: scroll.dir, isAtTop: scroll.top }
}