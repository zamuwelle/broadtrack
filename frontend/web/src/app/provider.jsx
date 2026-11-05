import { Suspense, useEffect, useMemo } from 'react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryConfig } from '@/lib/react-query'
import { setUnauthorizedHandler } from '@/lib/api-client'
import { clearAuthSession } from '@/lib/auth'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/ui/useToast'
import { isServerError } from '@/lib/errors'

export const AppProvider = ({ children }) => {
    const { show: showToast } = useToast()
    const queryClient = useMemo(
        () => {
            const showServerError = (error, source) => {
                if (!source.meta?.handlesError && isServerError(error)) {
                    showToast(error.message || 'Something went wrong.', 'danger')
                }
            }

            return new QueryClient({
                queryCache: new QueryCache({
                    onError: showServerError
                }),
                mutationCache: new MutationCache({
                    onError: (error, _variables, _context, mutation) => showServerError(error, mutation)
                }),
                defaultOptions: queryConfig
            })
        },
        [showToast]
    )

    useEffect(() => {
        setUnauthorizedHandler(() => clearAuthSession(queryClient))
        return () => {
            setUnauthorizedHandler(null)
        }
    }, [queryClient])

    return (
        <Suspense fallback={null}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toast />
            </QueryClientProvider>
        </Suspense>
    )
}
