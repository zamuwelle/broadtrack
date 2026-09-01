import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const resetPassword = (data) => api.post('/reset-password', data)

export const useResetPassword = ({ mutationConfig } = {}) =>
    useMutation({
        mutationFn: resetPassword,
        ...mutationConfig
    })
