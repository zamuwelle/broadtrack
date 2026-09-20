import { api } from '@/lib/api-client'

export const uploadEquipmentImage = ({ id, file }) => {
    const formData = file instanceof FormData ? file : new FormData()
    if (!(file instanceof FormData) && file) {
        formData.append('image', file)
    }
    return api.post(`/equipment/${id}/upload`, formData)
}
