import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const getBookings = async (params = {}) => {
    const response = await api.get('/bookings', { params })
    return response?.data ?? []
}

export const getBookingsQueryOptions = (params = {}) =>
    queryOptions({
        queryKey: ['bookings', params],
        queryFn: () => getBookings(params),
        staleTime: 30_000,
        refetchInterval: 60_000
    })

export const useBookings = ({ params = {}, queryConfig } = {}) =>
    useQuery({
        ...getBookingsQueryOptions(params),
        ...queryConfig
    })
