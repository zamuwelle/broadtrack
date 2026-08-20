import { useCallback, useEffect, useRef, useState } from 'react'
import { useBookings } from '@/hooks/queries/useBookings'
import { useEquipment } from '@/hooks/queries/useEquipment'
import { useBookingNotification } from '@/hooks/queries/useBookingNotification'
import { BorrowNavbar } from '@/components/borrow/BorrowNavbar'
import { Sidebar } from '@/components/ui/Sidebar'
import { EquipmentPage } from '@/pages/borrow/EquipmentPage'
import { CalendarPage } from '@/pages/borrow/CalendarPage'
import { SlipsPage } from '@/pages/borrow/SlipsPage'
import { useSidebarTab } from '@/hooks/ui/useSidebarTab'

const sidebarLinks = Object.freeze([
    Object.freeze({ label: 'Equipment', icon: 'equipment' }),
    Object.freeze({ label: 'Calendar', icon: 'calendar' }),
    Object.freeze({ label: 'My Slips', icon: 'slip' })
])

export const BorrowPage = (props) => {
    const { onReady } = props
    const mainReference = useRef(null)
    const [active, setActive] = useSidebarTab('borrow', 'Equipment')
    const [slipsFilterStatus, setSlipsFilterStatus] = useState('All Ticket Requests')

    useEffect(() => {
        if (mainReference.current) {
            mainReference.current.scrollTo(0, 0)
        }
    }, [active])

    const { isLoading: isEquipmentLoading } = useEquipment()
    const { data: bookings = [], isLoading: isBookingsLoading } = useBookings()
    const isReady = !isEquipmentLoading && !isBookingsLoading

    useEffect(() => {
        if (isReady && typeof onReady === 'function') {
            onReady()
        }
    }, [isReady, onReady])

    const handleSelectNotificationStatus = useCallback(
        (filterStatus) => {
            setSlipsFilterStatus(filterStatus)
            setActive('My Slips')
        },
        [setActive]
    )

    useBookingNotification(handleSelectNotificationStatus)

    if (!isReady) {
        return null
    }

    let pageContent = <EquipmentPage />
    if (active === 'Calendar') {
        pageContent = <CalendarPage />
    } else if (active === 'My Slips') {
        pageContent = <SlipsPage selectedStatus={slipsFilterStatus} onSelectStatus={setSlipsFilterStatus} />
    }

    const containerClass = active === 'Calendar' ? 'flex-1 flex flex-col p-4 lg:min-h-0 lg:p-8' : 'p-4 lg:p-8'

    return (
        <div className="h-screen flex flex-col font-['Poppins']">
            <BorrowNavbar
                bookings={bookings}
                onSelectTab={setActive}
                onSelectNotificationStatus={handleSelectNotificationStatus}
                sidebarLinks={sidebarLinks}
                activeTab={active}
            />
            <div className="flex flex-1 min-h-0">
                <Sidebar
                    links={sidebarLinks}
                    active={active}
                    onSelect={setActive}
                    contentWidth="w-[122px]"
                    className="hidden lg:flex"
                />
                <main ref={mainReference} className="flex-1 overflow-y-auto bg-background flex flex-col">
                    <div className={containerClass}>{pageContent}</div>
                </main>
            </div>
        </div>
    )
}
