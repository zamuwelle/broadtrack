import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const getUsers = async () => {
    const response = await api.get('/users')
    return response?.data ?? []
}

export const getUsersQueryOptions = () =>
    queryOptions({
        queryKey: ['users'],
        queryFn: getUsers,
        staleTime: 30_000,
        refetchInterval: 60_000
    })

export const useUsers = ({ queryConfig } = {}) =>
    useQuery({
        ...getUsersQueryOptions(),
        ...queryConfig
    })
