import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const useCheckResetToken = ({ email, token, enabled }) =>
    useQuery({
        queryKey: ['reset-link', email, token],
        queryFn: async () => {
            if (!email || !token) {
                return false
            }
            try {
                const response = await api.post('/check-reset-token', { email, token }, { timeout: 10_000 })
                return response.data.valid
            } catch (error) {
                if (error.status === 422) {
                    return false
                }
                throw error
            }
        },
        enabled,
        meta: { handlesError: true },
        retry: false,
        gcTime: 0,
        refetchOnWindowFocus: false
    })
