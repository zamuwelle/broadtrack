export const makeContact = (api) => ({
    send: (data) => api.post('/contact', data)
})
