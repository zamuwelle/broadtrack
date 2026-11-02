import { api } from '@/lib/api-client'

export const resendVerification = (data) => api.post('/resend-verification', data)
