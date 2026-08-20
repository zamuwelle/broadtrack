export const makeEquipment = (api) => ({
    list: () => api.get('/equipment'),
    create: (data) => api.post('/equipment', data),
    update: (id, data) => api.put(`/equipment/${id}`, data),
    upload: (id, formData) => api.post(`/equipment/${id}/upload`, formData),
    delete: (id) => api.delete(`/equipment/${id}`)
})
