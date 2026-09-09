import { api } from '@/lib/api-client'

export const createEquipment = (data) => api.post('/equipment', data)
