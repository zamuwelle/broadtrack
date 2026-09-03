import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const uploadProfilePicture = (fileOrFormData) => {
    if (fileOrFormData instanceof FormData) {
        return api.post('/profile/picture', fileOrFormData)
    }
    const formData = new FormData()
    formData.append('image', fileOrFormData)
    return api.post('/profile/picture', formData)
}

export const useUploadProfilePicture = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: uploadProfilePicture,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['me'] })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
