import { Suspense, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryConfig } from '@/lib/react-query'
import { setUnauthorizedHandler } from '@/lib/api-client'
import { clearAuthSession } from '@/lib/auth'

export const AppProvider = ({ children }) => {
    const queryClient = useMemo(
        () =>
            new QueryClient({
                defaultOptions: queryConfig
            }),
        []
    )

    useEffect(() => {
        setUnauthorizedHandler(() => clearAuthSession(queryClient))
        return () => {
            setUnauthorizedHandler(null)
        }
    }, [queryClient])

    return (
        <Suspense fallback={null}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Suspense>
    )
}
