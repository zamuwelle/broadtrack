import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const updateUser = ({ userId, data }) => api.patch(`/users/${userId}`, data)

export const useUpdateUser = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: updateUser,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
