import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const getEquipment = async () => {
    const response = await api.get('/equipment')
    return response?.data ?? []
}

export const getEquipmentQueryOptions = () =>
    queryOptions({
        queryKey: ['equipment'],
        queryFn: getEquipment,
        staleTime: 30_000,
        refetchInterval: 60_000
    })

export const useEquipment = ({ queryConfig } = {}) =>
    useQuery({
        ...getEquipmentQueryOptions(),
        ...queryConfig
    })
