import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const loginUser = (credentials) => api.post('/login', credentials)

export const useLogin = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (response, variables, context) => {
            const token = response?.data?.token
            const user = response?.data?.user
            if (token) {
                globalThis.localStorage?.setItem('auth_token', token)
            }
            if (user) {
                queryClient.setQueryData(['me'], user)
            }
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
