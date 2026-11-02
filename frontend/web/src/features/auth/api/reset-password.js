import { api } from '@/lib/api-client'

export const resetPassword = (data) => api.post('/reset-password', data)
