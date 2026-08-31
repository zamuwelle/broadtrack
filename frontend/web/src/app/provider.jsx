import { Suspense, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryConfig } from '@/lib/react-query'

export const AppProvider = ({ children }) => {
    const queryClient = useMemo(
        () =>
            new QueryClient({
                defaultOptions: queryConfig
            }),
        []
    )

    return (
        <Suspense fallback={null}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Suspense>
    )
}
