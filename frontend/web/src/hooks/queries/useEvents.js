import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { echo } from '@/lib/echo'

export const useEvents = ({ onBookingNotification } = {}) => {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!echo) {
            return
        }

        const equipmentChannel = echo.channel('equipment')
        const bookingsChannel = echo.channel('bookings')
        const usersChannel = echo.channel('users')

        equipmentChannel.listen('.equipment.changed', () => queryClient.invalidateQueries({ queryKey: ['equipment'] }))
        bookingsChannel.listen('.booking.changed', (event) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            queryClient.invalidateQueries({ queryKey: ['equipment'] })
            if (typeof onBookingNotification === 'function') {
                onBookingNotification(event)
            }
        })
        usersChannel.listen('.user.changed', () => queryClient.invalidateQueries({ queryKey: ['users'] }))

        return () => {
            equipmentChannel.stopListening('.equipment.changed')
            bookingsChannel.stopListening('.booking.changed')
            usersChannel.stopListening('.user.changed')
        }
    }, [queryClient, onBookingNotification])
}
