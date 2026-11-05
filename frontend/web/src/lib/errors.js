export const isCancelledError = (error) => error?.code === 'ERR_CANCELED' || error?.cause?.code === 'ERR_CANCELED'

export const isServerError = (error) => {
    if (!error || isCancelledError(error)) {
        return false
    }
    const status = error.status ?? error.response?.status
    if (status) {
        return status >= 500
    }
    return Boolean(
        error.isAxiosError ||
        ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code) ||
        error.message === 'Network Error'
    )
}

export const isLocalError = (error) => !isCancelledError(error) && !isServerError(error)
