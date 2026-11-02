import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const deleteEquipment = (id) => api.delete(`/equipment/${id}`)

export const useDeleteEquipment = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: deleteEquipment,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
