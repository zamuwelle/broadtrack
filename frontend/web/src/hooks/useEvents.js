import { useQueryClient } from '@tanstack/react-query'
import { useEventStream } from '@laravel/stream-react'

export default () => {
	const queryClient = useQueryClient()

	useEventStream(`${import.meta.env.VITE_API_URL}/events?token=${localStorage.getItem('auth_token')}`, {
		eventName: 'equipment.status',
		onMessage: ({ data }) => {
			const { id, status } = JSON.parse(data)
			queryClient.setQueryData(['equipment'], (current) => current?.map((item) => item.id === id ? { ...item, status } : item))
		},
	})
}
