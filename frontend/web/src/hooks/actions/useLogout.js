import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/api'

export const useLogout = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return async () => {
        try {
            await authService.logout()
        } catch {
            // ignore logout network errors
        }
        localStorage.removeItem('auth_token')
        queryClient.setQueryData(['me'], null)
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== 'me'
        })
        navigate('/')
    }
}
