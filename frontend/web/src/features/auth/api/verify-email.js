import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const verifyEmail = (data) => api.post('/verify-email', data)

export const useVerifyEmail = ({ mutationConfig } = {}) =>
    useMutation({
        mutationFn: verifyEmail,
        ...mutationConfig
    })
