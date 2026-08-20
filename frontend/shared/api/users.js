export const makeUsers = (api) => ({
    list: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    remove: (id) => api.delete(`/users/${id}`)
})
