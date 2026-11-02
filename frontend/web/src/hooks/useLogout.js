import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/api'

export default () => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	return async () => {
		try { await authService.logout() } catch { }
		localStorage.removeItem('auth_token')
		sessionStorage.removeItem('just_logged_in')
		queryClient.clear()
		navigate('/')
	}
}