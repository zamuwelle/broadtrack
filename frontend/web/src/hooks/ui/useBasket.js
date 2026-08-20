import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEquipmentStatus } from '@shared/util/equipment'

export const useBasket = () => {
    const queryClient = useQueryClient()
    const { data: items = [] } = useQuery({
        queryKey: ['basket'],
        queryFn: () => queryClient.getQueryData(['basket']) ?? [],
        initialData: [],
        staleTime: Infinity
    })

    const toggleItem = useCallback(
        (equipment) =>
            queryClient.setQueryData(['basket'], (prev = []) => {
                if (prev.some((item) => item.id === equipment.id)) {
                    return prev.filter((item) => item.id !== equipment.id)
                }
                if (getEquipmentStatus(equipment) !== 'maintenance') {
                    return [...prev, equipment]
                }
                return prev
            }),
        [queryClient]
    )

    const removeItem = useCallback(
        (equipmentId) =>
            queryClient.setQueryData(['basket'], (prev = []) => prev.filter((item) => item.id !== equipmentId)),
        [queryClient]
    )

    const clearBasket = useCallback(() => queryClient.setQueryData(['basket'], []), [queryClient])
    const isSelected = useCallback((equipmentId) => items.some((item) => item.id === equipmentId), [items])

    return {
        items,
        count: items.length,
        isSelected,
        toggleItem,
        removeItem,
        clearBasket
    }
}
