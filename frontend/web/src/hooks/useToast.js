import { useEffect, useRef, useState } from 'react'

export default (duration = 3000) => {
	const [message, setMessage] = useState('')
	const [visible, setVisible] = useState(false)
	const timer = useRef(null)

	const show = (nextMessage) => {
		setMessage(nextMessage)
		setVisible(true)
		clearTimeout(timer.current)
		timer.current = setTimeout(() => setVisible(false), duration)
	}

	useEffect(() => () => clearTimeout(timer.current), [])

	return { message, visible, show }
}