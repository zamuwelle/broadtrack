import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { preloadEquipmentImages } from '@shared/util/image'

export const getEquipment = async () => {
    const response = await api.get('/equipment')
    const items = response?.data ?? []
    preloadEquipmentImages(items)
    return items
}

export const getEquipmentQueryOptions = () =>
    queryOptions({
        queryKey: ['equipment'],
        queryFn: getEquipment
    })

export const useEquipment = ({ queryConfig } = {}) =>
    useQuery({
        ...getEquipmentQueryOptions(),
        ...queryConfig
    })
