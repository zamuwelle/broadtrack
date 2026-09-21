import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const uploadEquipmentImage = ({ id, file }) => {
    const formData = file instanceof FormData ? file : new FormData()
    if (!(file instanceof FormData) && file) {
        formData.append('image', file)
    }
    return api.post(`/equipment/${id}/upload`, formData)
}

export const useUploadEquipmentImage = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: uploadEquipmentImage,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
