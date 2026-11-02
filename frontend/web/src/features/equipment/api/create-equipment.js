import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const createEquipment = (data) => api.post('/equipment', data)

export const useCreateEquipment = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: createEquipment,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
