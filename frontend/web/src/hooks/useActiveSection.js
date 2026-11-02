import { useState, useEffect } from 'react'

export default () => {
	const [active, setActive] = useState('')
	useEffect(() => {
		const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-50% 0px -50% 0px' })
		document.querySelectorAll('section[id]').forEach((s) => obs.observe(s))
		return () => obs.disconnect()
	}, [])
	return active
}