import { api } from '@/lib/api-client'

export const deleteEquipment = (id) => api.delete(`/equipment/${id}`)
