import { useCallback, useEffect, useRef } from 'react'
import { getNotificationConfig } from '@/features/borrow/components/notificationConfig'
import { useEvents } from '@/hooks/queries/useEvents'
import { useUser } from '@/lib/auth'
import { api } from '@/lib/api-client'

const noop = () => null

const resolveNotificationConfig = ({ event, booking, isAdmin, userId }) => {
    if (isAdmin) {
        if (event.action === 'created') {
            return {
                headline: 'New Booking Request',
                details: `Booking request ${booking.ticket_id ?? ''} is pending approval.`,
                destination: 'Approvals'
            }
        }
        if (event.action === 'cancelled') {
            return {
                headline: 'Booking Cancelled',
                details: `Booking request ${booking.ticket_id ?? ''} was cancelled.`,
                destination: 'Approvals'
            }
        }
        return null
    }
    if (userId && String(booking.user_id) === String(userId)) {
        const baseConfig = getNotificationConfig(booking)
        if (baseConfig) {
            return {
                ...baseConfig,
                destination: baseConfig.filterStatus
            }
        }
    }
    return null
}

export const useBookingNotification = (onNavigate = noop) => {
    const { data: user } = useUser()
    const navigateRef = useRef(onNavigate)
    const notificationSessionRef = useRef(null)

    useEffect(() => {
        navigateRef.current = onNavigate
    }, [onNavigate])

    const role = user ? user.role : ''
    const isAdmin = role === 'admin' || role === 'sysadmin'
    const userId = user ? user.id : null

    useEffect(() => {
        const session = { active: true }
        notificationSessionRef.current = session
        return () => {
            session.active = false
        }
    }, [isAdmin, userId])

    useEffect(() => {
        if (!('Notification' in globalThis) || globalThis.Notification.permission !== 'default') {
            return
        }

        const handleUserInteraction = () => {
            globalThis.Notification.requestPermission()
            globalThis.removeEventListener('click', handleUserInteraction)
            globalThis.removeEventListener('keydown', handleUserInteraction)
        }

        globalThis.addEventListener('click', handleUserInteraction, { once: true })
        globalThis.addEventListener('keydown', handleUserInteraction, {
            once: true
        })

        return () => {
            globalThis.removeEventListener('click', handleUserInteraction)
            globalThis.removeEventListener('keydown', handleUserInteraction)
        }
    }, [])

    const handleNotification = useCallback(
        async (event = {}) => {
            if (
                !event.bookingId ||
                !('Notification' in globalThis) ||
                globalThis.Notification.permission !== 'granted'
            ) {
                return
            }
            if (isAdmin && event.action !== 'created' && event.action !== 'cancelled') {
                return
            }

            const session = notificationSessionRef.current
            let booking
            try {
                const response = await api.get(`/bookings/${event.bookingId}`)
                booking = response?.data
            } catch {
                return
            }
            if (!booking || !session?.active || session !== notificationSessionRef.current) {
                return
            }

            const config = resolveNotificationConfig({
                booking,
                event,
                isAdmin,
                userId
            })

            if (!config) {
                return
            }

            const notification = new globalThis.Notification(config.headline, {
                body: config.details,
                icon: '/favicon.ico'
            })

            notification.addEventListener('click', () => {
                globalThis.focus()
                if (typeof navigateRef.current === 'function') {
                    navigateRef.current(config.destination)
                }
                notification.close()
            })
        },
        [isAdmin, userId]
    )

    useEvents({ onBookingNotification: handleNotification })
}
