export const createApi = (baseURL, getToken = () => '') => {
	const request = async (endpoint, { method = 'GET', body, params, headers = {}, timeout = 8000 } = {}) => {
		if (params && Object.keys(params).length) endpoint += '?' + new URLSearchParams(params)
		const abortController = new AbortController()
		const timeoutTimer = setTimeout(() => abortController.abort(), timeout)
		const token = getToken()
		let response
		try {
			response = await fetch(baseURL + endpoint, {
				method,
				signal: abortController.signal,
				headers: { Accept: 'application/json', ...(body && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }), ...headers },
				...(body && { body: JSON.stringify(body) })
			})
		} catch {
			throw new Error(abortController.signal.aborted ? 'Request timed out' : 'Network error — is the server running?')
		} finally {
			clearTimeout(timeoutTimer)
		}
		const data = await response.json().catch(() => ({}))
		if (!response.ok) throw Object.assign(new Error(data.message || `Request failed (${response.status})`), { status: response.status, errors: data.errors || {} })
		return data
	}
	return {
		get: (endpoint, params) => request(endpoint, { params }),
		post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
		put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
		patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
		delete: (endpoint) => request(endpoint, { method: 'DELETE' })
	}
}