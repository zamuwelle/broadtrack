import { describe, expect, it } from 'vite-plus/test'
import {
    flattenBookingsByEquipment,
    getBookingStatus,
    getBookingStatusBadge,
    resolveBookingScheduleStatus
} from '@shared/util/booking'

describe('booking helpers', () => {
    it('normalizes string and object statuses', () => {
        expect(getBookingStatus('APPROVED')).toBe('approved')
        expect(getBookingStatus({ status: { value: 'RETURNED' } })).toBe('returned')
    })

    it('gives overdue bookings the overdue badge', () => {
        expect(getBookingStatusBadge({ status: 'approved', is_overdue: true })).toEqual({
            label: 'Overdue',
            variant: 'overdue'
        })
    })

    it('treats pending, rejected, and cancelled bookings as inactive schedules', () => {
        expect(resolveBookingScheduleStatus({ status: 'pending' })).toBe('pending')
        expect(resolveBookingScheduleStatus({ status: 'rejected' })).toBe('rejected')
        expect(resolveBookingScheduleStatus({ status: 'cancelled' })).toBe('cancelled')
        expect(resolveBookingScheduleStatus({ status: 'approved' })).toBe('active')
    })

    it('flattens multi-equipment bookings with stable item keys', () => {
        const booking = {
            id: 8,
            equipments: [
                { id: 2, name: 'Camera' },
                { id: 3, name: 'Tripod' }
            ]
        }

        expect(flattenBookingsByEquipment([booking])).toEqual([
            {
                ...booking,
                itemKey: '8-2',
                equipment: booking.equipments[0],
                equipments: [booking.equipments[0]]
            },
            {
                ...booking,
                itemKey: '8-3',
                equipment: booking.equipments[1],
                equipments: [booking.equipments[1]]
            }
        ])
    })
})
