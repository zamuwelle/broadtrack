import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const forgotPassword = (data) => api.post('/forgot-password', data)

export const useForgotPassword = ({ mutationConfig } = {}) =>
    useMutation({
        mutationFn: forgotPassword,
        ...mutationConfig
    })
