import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export const remindBooking = (bookingId) => api.post(`/bookings/${bookingId}/remind`)

export const useRemindBooking = ({ mutationConfig } = {}) => {
    const { onSuccess, ...restConfig } = mutationConfig ?? {}

    return useMutation({
        mutationFn: remindBooking,
        onSuccess: (response, variables, context) => {
            onSuccess?.(response, variables, context)
        },
        ...restConfig
    })
}
