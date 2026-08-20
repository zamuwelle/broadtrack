import { useQueryClient } from '@tanstack/react-query'

export const useInvalidateBookings = () => {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['equipment'] })
    }
}
