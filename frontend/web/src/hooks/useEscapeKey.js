import { useEffect } from 'react'

export default (onEscape) => {
	useEffect(() => {
		const onKey = (e) => e.key === 'Escape' && onEscape()
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [onEscape])
}