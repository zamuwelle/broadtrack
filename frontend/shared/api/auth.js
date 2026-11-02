	export const makeAuth = (api) => ({
	login: (credentials) => api.post('/login', credentials),
	register: (data) => api.post('/register', data),
	forgotPassword: (data) => api.post('/forgot-password', data),
	resetPassword: (data) => api.post('/reset-password', data),
	logout: () => api.post('/logout'),
	me: () => api.get('/me'),
	update: (data) => api.patch('/profile', data),
})
