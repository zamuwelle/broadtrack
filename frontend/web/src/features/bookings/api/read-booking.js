import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const markBookingAsRead = (bookingId) => api.put(`/bookings/${bookingId}/read`)

export const useMarkBookingAsRead = ({ mutationConfig } = {}) => {
    const queryClient = useQueryClient()
    const { onSuccess, onMutate, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: markBookingAsRead,
        onMutate: (bookingId) => {
            queryClient.setQueriesData({ queryKey: ['bookings'] }, (current) =>
                Array.isArray(current)
                    ? current.map((booking) =>
                          booking.id === bookingId ? { ...booking, is_read: true, isRead: true } : booking
                      )
                    : current
            )
            return onMutate?.(bookingId)
        },
        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
