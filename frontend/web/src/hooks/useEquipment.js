import { useQuery } from '@tanstack/react-query'
import { equipmentService } from '@/api'

export default () => useQuery({
	queryKey: ['equipment'],
	queryFn: () => equipmentService.list().then(({ data }) => data),
	enabled: !!localStorage.getItem('auth_token'),
	staleTime: Infinity,
	retry: (failureCount, error) => error?.status !== 401 && failureCount < 2,
})