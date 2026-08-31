import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const createUser = (data) => api.post('/users', data)

export const useCreateUser = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: createUser,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
