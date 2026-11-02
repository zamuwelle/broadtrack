export const parseBlobError = async (data, defaultMessage) => {
    if (!(data instanceof Blob) || !data.type.includes('application/json')) {
        return null
    }
    const text = await data.text()
    try {
        const parsed = JSON.parse(text)
        return parsed.message || defaultMessage
    } catch {
        return defaultMessage
    }
}
