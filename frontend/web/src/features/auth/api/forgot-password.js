import { api } from '@/lib/api-client'

export const forgotPassword = (data) => api.post('/forgot-password', data)
