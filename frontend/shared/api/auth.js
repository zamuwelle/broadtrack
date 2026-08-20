export const makeAuth = (api) => ({
    login: (credentials) => api.post('/login', credentials),
    register: (form) => api.post('/register', form),
    forgotPassword: (data) => api.post('/forgot-password', data),
    resetPassword: (data) => api.post('/reset-password', data),
    logout: () => api.post('/logout'),
    me: () => api.get('/me'),
    update: (data) => api.patch('/profile', data),
    uploadPicture: (fileOrFormData) => {
        if (fileOrFormData instanceof FormData) {
            return api.post('/profile/picture', fileOrFormData)
        }
        const formData = new FormData()
        formData.append('image', fileOrFormData)
        return api.post('/profile/picture', formData)
    }
})
