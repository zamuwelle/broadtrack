import { api } from '@/lib/api-client'

export const registerUser = (data) => api.post('/register', data)
