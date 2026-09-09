import { api } from '@/lib/api-client'

export const updateEquipment = ({ id, data }) => api.put(`/equipment/${id}`, data)
