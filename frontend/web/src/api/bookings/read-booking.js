import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const markBookingAsRead = (bookingId) =>
    api.patch(`/bookings/${bookingId}/read`)

export const useMarkBookingAsRead = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: markBookingAsRead,
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
