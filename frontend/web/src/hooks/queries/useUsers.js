import { useQuery } from '@tanstack/react-query'
import { userService } from '@/api'

export const useUsers = (options = {}) =>
    useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await userService.list()
            return data ?? []
        },
        ...options
    })
