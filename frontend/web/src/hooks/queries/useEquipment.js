import { useQuery } from '@tanstack/react-query'
import { equipmentService } from '@/api'

export const useEquipment = (options = {}) =>
    useQuery({
        queryKey: ['equipment'],
        staleTime: 30_000,
        refetchInterval: 60_000,
        queryFn: async () => {
            const { data } = await equipmentService.list()
            return data ?? []
        },
        ...options
    })
