import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const cancelBooking = (bookingId) =>
    api.put(`/bookings/${bookingId}/cancel`)

export const useCancelBooking = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: cancelBooking,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
