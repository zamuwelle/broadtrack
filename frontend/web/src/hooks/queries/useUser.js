import { useQuery } from '@tanstack/react-query'
import { authService } from '@/api'

export const useUser = (options = {}) =>
    useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                const { data } = await authService.me()
                return data
            } catch (error) {
                if (error && error.status === 401 && typeof localStorage !== 'undefined') {
                    localStorage.removeItem('auth_token')
                }
                return null
            }
        },
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        ...options
    })
