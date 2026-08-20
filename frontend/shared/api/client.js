const buildUrl = (baseURL, endpoint, params) => {
    const queryString =
        params && Object.keys(params).length > 0
            ? `${endpoint.includes('?') ? '&' : '?'}${new URLSearchParams(params)}`
            : ''
    return `${baseURL.replace(/\/+$/u, '')}/${endpoint.replace(/^\/+/u, '')}${queryString}`
}

const buildHeaders = (body, isFormData, token, headers) => ({
    Accept: 'application/json',
    ...(body && !isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers
})

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        const message = data.message || `Request failed (${response.status})`
        const error = new Error(message)
        error.status = response.status
        error.errors = data.errors || {}
        throw error
    }
    return data
}

export const createApi = (baseURL = '', getToken = () => '') => {
    const request = async (endpoint, { method = 'GET', body, params, headers = {}, timeout = 8000 } = {}) => {
        const isFormData = body instanceof FormData
        const token = getToken()
        const url = buildUrl(baseURL, endpoint, params)
        const requestHeaders = buildHeaders(body, isFormData, token, headers)

        try {
            const response = await fetch(url, {
                method,
                signal: AbortSignal.timeout(timeout),
                headers: requestHeaders,
                ...(body && { body: isFormData ? body : JSON.stringify(body) })
            })
            return await handleResponse(response)
        } catch (error) {
            if (error.status) {
                throw error
            }
            throw new Error(error.name === 'TimeoutError' ? 'Request timed out' : 'Network error', { cause: error })
        }
    }

    return {
        get: (endpoint, parameters) => request(endpoint, { params: parameters }),
        post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
        put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
        patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
        delete: (endpoint) => request(endpoint, { method: 'DELETE' })
    }
}
