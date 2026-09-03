import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const updateProfile = (data) => api.put('/profile', data)

export const useUpdateProfile = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['me'] })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
