import { useEffect, useRef, useState } from 'react'
import useEscapeKey from '@/hooks/useEscapeKey'

export default () => {
	const [open, setOpen] = useState(false)
	const boxRef = useRef(null)

	useEscapeKey(() => setOpen(false))

	useEffect(() => {
		if (!open) return
		const onDocClick = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [open])

	return { open, setOpen, boxRef }
}