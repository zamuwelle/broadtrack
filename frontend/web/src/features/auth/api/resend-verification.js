import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const resendVerification = (data) => api.post('/resend-verification', data)

export const useResendVerification = ({ mutationConfig } = {}) =>
    useMutation({
        mutationFn: resendVerification,
        ...mutationConfig
    })
