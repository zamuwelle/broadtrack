import { api } from '@/lib/api-client'

export const verifyEmail = (data) => api.post('/verify-email', data)
