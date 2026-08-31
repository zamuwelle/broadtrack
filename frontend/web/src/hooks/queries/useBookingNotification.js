import { useCallback, useEffect, useRef } from 'react'
import { getNotificationConfig } from '@/features/borrow/components/notificationConfig'
import { useEvents } from '@/hooks/queries/useEvents'
import { useUser } from '@/lib/auth'

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

    useEffect(() => {
        navigateRef.current = onNavigate
    }, [onNavigate])

    const role = user ? user.role : ''
    const isAdmin = role === 'admin' || role === 'sysadmin'
    const userId = user ? user.id : null

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
        (event = {}) => {
            const booking = event ? event.booking : null
            if (!booking || !('Notification' in globalThis) || globalThis.Notification.permission !== 'granted') {
                return
            }

            const config = resolveNotificationConfig({
                booking,
                event,
                isAdmin,
                userId
            })

            if (!config || !config.headline || !config.destination) {
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
