import { api } from '@/lib/api-client'

export const updateProfile = (data) => api.put('/profile', data)
