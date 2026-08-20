export const makeBookings = (api) => ({
    list: (parameters = {}) => api.get('/bookings', parameters),
    create: (data) => api.post('/bookings', data),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    approve: (id, data = {}) => api.put(`/bookings/${id}/approve`, data),
    reject: (id, data = {}) => api.put(`/bookings/${id}/reject`, data),
    release: (id) => api.put(`/bookings/${id}/release`),
    return: (id) => api.put(`/bookings/${id}/return`),
    remind: (id) => api.post(`/bookings/${id}/remind`),
    isRead: (id) => api.patch(`/bookings/${id}/read`)
})
