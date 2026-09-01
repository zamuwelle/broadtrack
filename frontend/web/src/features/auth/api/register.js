import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const registerUser = (data) => api.post('/register', data)

export const useRegister = ({ mutationConfig } = {}) =>
    useMutation({
        mutationFn: registerUser,
        ...mutationConfig
    })
