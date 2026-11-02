import { useQuery } from '@tanstack/react-query'
import { authService } from '@/api'

export default () => useQuery({
	queryKey: ['me'],
	queryFn: () => authService.me().then(({ data }) => data),
	enabled: !!localStorage.getItem('auth_token'),
	staleTime: Infinity,
	retry: (failureCount, error) => error?.status !== 401 && failureCount < 2,
})