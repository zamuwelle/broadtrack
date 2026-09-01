import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const releaseBooking = (bookingId) => api.put(`/bookings/${bookingId}/release`)

export const useReleaseBooking = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: releaseBooking,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
