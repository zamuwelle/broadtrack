import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const getUsers = async () => {
    const response = await api.get('/users')
    return response?.data ?? []
}

export const getUsersQueryOptions = () =>
    queryOptions({
        queryKey: ['users'],
        queryFn: getUsers
    })

export const useUsers = ({ queryConfig } = {}) =>
    useQuery({
        ...getUsersQueryOptions(),
        ...queryConfig
    })
