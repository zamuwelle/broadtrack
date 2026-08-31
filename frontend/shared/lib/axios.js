import axios from 'axios'

export const createApi = ({ baseURL = '', getToken = () => null, onUnauthorized = () => null } = {}) => {
    const instance = axios.create({
        baseURL,
        headers: {
            Accept: 'application/json'
        }
    })

    instance.interceptors.request.use((config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    instance.interceptors.response.use(
        (response) => (response.status === 204 ? null : response.data),
        (rejection) => {
            const data = rejection.response?.data ?? {}
            rejection.message = data.message ?? rejection.message
            rejection.errors = data.errors ?? {}
            rejection.status = rejection.response?.status

            if (rejection.status === 401) {
                onUnauthorized()
            }

            return Promise.reject(rejection)
        }
    )

    return instance
}
