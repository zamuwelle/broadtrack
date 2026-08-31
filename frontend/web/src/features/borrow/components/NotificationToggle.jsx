import { useCallback, useMemo, useState } from 'react'
import { useToggle } from '@/hooks/ui/useToggle'
import { Icon } from '@/components/ui/Icon'
import { getNotificationConfig } from '@/features/borrow/components/notificationConfig'
import { NotificationItem } from '@/features/borrow/components/NotificationItem'
import { useMarkBookingAsRead } from '@/api/bookings/read-booking'

const defaultBookings = Object.freeze([])
const noop = () => null

const formatRelativeTime = (dateValue) => {
    if (!dateValue) {
        return ''
    }
    const timestamp = new Date(String(dateValue).replace(' ', 'T')).getTime()
    if (Number.isNaN(timestamp)) {
        return ''
    }
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
    if (seconds < 60) {
        return 'Just now'
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return `${hours} hr${hours > 1 ? 's' : ''} ago`
    }
    const days = Math.floor(hours / 24)
    return days === 1 ? 'Yesterday' : `${days} days ago`
}

export const NotificationToggle = ({ bookings = defaultBookings, onSelectNotification = noop, onOpen = noop }) => {
    const { open, setOpen, boxRef } = useToggle()
    const readMutation = useMarkBookingAsRead()
    const [readIds, setReadIds] = useState(() => new Set())

    const notificationList = useMemo(() => {
        const list = []
        for (const booking of bookings) {
            const config = getNotificationConfig(booking)
            if (config) {
                list.push({
                    id: booking.id,
                    ticketId: booking.ticket_id,
                    filterStatus: config.filterStatus,
                    icon: config.icon,
                    headline: config.headline,
                    details: config.details,
                    timestamp: formatRelativeTime(booking.updated_at || booking.created_at),
                    isRead: Boolean(booking.isRead ?? booking.is_read)
                })
            }
        }
        return list.toReversed()
    }, [bookings])

    const unreadNotifications = useMemo(
        () => notificationList.filter((item) => !item.isRead && !readIds.has(item.id)),
        [notificationList, readIds]
    )

    const notificationCount = unreadNotifications.length

    const handleClickItem = useCallback(
        async (item) => {
            setReadIds((prev) => new Set(prev).add(item.id))
            setOpen(false)
            onSelectNotification(item.filterStatus)
            try {
                await readMutation.mutateAsync(item.id)
            } catch {
                /* empty */
            }
        },
        [onSelectNotification, readMutation, setOpen]
    )

    const handleToggleBell = useCallback(() => {
        if ('Notification' in globalThis && globalThis.Notification.permission === 'default') {
            globalThis.Notification.requestPermission()
        }
        if (!open) {
            onOpen()
        }
        setOpen(!open)
    }, [open, onOpen, setOpen])

    return (
        <div className="relative font-['Poppins']" ref={boxRef}>
            <button
                type="button"
                onClick={handleToggleBell}
                className="relative flex h-6 w-[22px] shrink-0 items-center justify-center cursor-pointer">
                {open ? <span className="absolute -inset-1 rounded-2xl bg-blue-200 pointer-events-none" /> : null}
                <Icon name="bell" className="relative h-6 w-[22px] shrink-0" />
                {notificationCount > 0 ? (
                    <span className="select-none absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[12px] text-surface">
                        {notificationCount}
                    </span>
                ) : null}
            </button>
            {open ? (
                <div className="fixed left-1/2 -translate-x-1/2 top-[72px] sm:absolute sm:top-[52px] sm:right-0 sm:left-auto sm:translate-x-0 z-50 w-80 max-w-[calc(100vw-32px)]">
                    <div className="inline-flex w-full max-h-[302px] overflow-y-auto flex-col items-start justify-start gap-1.5 rounded-lg bg-slate-50 p-1.5 shadow-lg outline outline-1 outline-offset-[-1px] outline-slate-300">
                        {unreadNotifications.length > 0 ? (
                            unreadNotifications.map((notificationItem) => (
                                <NotificationItem
                                    key={notificationItem.id}
                                    item={notificationItem}
                                    onClick={handleClickItem}
                                />
                            ))
                        ) : (
                            <div className="flex h-24 w-full items-center justify-center text-xs text-slate-400">
                                No notifications yet.
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
