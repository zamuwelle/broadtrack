import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const createContact = (data) => api.post('/contact', data)

export const useCreateContact = ({ mutationConfig } = {}) =>
    useMutation({
        ...mutationConfig,
        mutationFn: createContact
    })
