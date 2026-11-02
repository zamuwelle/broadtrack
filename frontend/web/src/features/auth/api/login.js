import { api } from '@/lib/api-client'

export const loginUser = (credentials) => api.post('/login', credentials)
