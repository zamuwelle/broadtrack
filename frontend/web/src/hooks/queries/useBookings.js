import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/api'

const defaultParameters = Object.freeze({})

export const useBookings = (parameters = defaultParameters, options = {}) =>
    useQuery({
        queryKey: ['bookings', parameters],
        staleTime: 30_000,
        refetchInterval: 60_000,
        queryFn: async () => {
            const { data } = await bookingService.list(parameters)
            return data ?? []
        },
        ...options
    })
