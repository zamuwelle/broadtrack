import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export const useInvalidateBookings = () => {
    const queryClient = useQueryClient()
    return useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['equipment'] })
    }, [queryClient])
}
