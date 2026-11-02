import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const getBookings = async (params) => {
    const response = await api.get('/bookings', { params })
    return response?.data ?? []
}

export const getBookingsQueryOptions = (params) =>
    queryOptions({
        queryKey: params && Object.keys(params).length > 0 ? ['bookings', params] : ['bookings'],
        queryFn: () => getBookings(params)
    })

export const useBookings = ({ params, queryConfig } = {}) =>
    useQuery({
        ...getBookingsQueryOptions(params),
        ...queryConfig
    })
