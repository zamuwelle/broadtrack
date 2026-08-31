import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const rejectBooking = ({ bookingId, data = {} }) =>
    api.put(`/bookings/${bookingId}/reject`, data)

export const useRejectBooking = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: rejectBooking,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
