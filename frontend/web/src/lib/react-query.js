export const queryConfig = Object.freeze({
    queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failureCount, error) => (error ? error.status !== 401 : true) && failureCount < 2
    }
})
