import { describe, expect, it, vi } from 'vite-plus/test'
import {
    addBookingMinutes,
    formatBookingTimeRange,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatShortDate,
    formatSimpleDate,
    getBookingDateKey,
    getBookingDateTimeValue,
    getNextBookingHourValue
} from '@shared/util/date'

describe('booking date helpers', () => {
    it('formats UTC timestamps using the Manila calendar date', () => {
        expect(getBookingDateKey('2026-10-25T16:30:00Z')).toBe('2026-10-26')
        expect(getBookingDateTimeValue('2026-10-25T16:30:00Z')).toBe('2026-10-26T00:30')
    })

    it('formats naive Manila date strings correctly', () => {
        expect(getBookingDateKey('2026-10-26 15:30:00')).toBe('2026-10-26')
        expect(getBookingDateTimeValue('2026-10-26 15:15')).toBe('2026-10-26T15:15')
    })

    it('adds minutes while preserving the Manila display value', () => {
        expect(addBookingMinutes('2026-10-25T16:30:00Z', 60)).toBe('2026-10-26T01:30')
    })

    it('rounds to the start of the next Manila hour for getNextBookingHourValue', () => {
        expect(getNextBookingHourValue('2026-10-26T15:15')).toBe('2026-10-26T16:00')
        expect(getNextBookingHourValue('2026-10-26 15:15:00')).toBe('2026-10-26T16:00')
    })

    it('formats dates in various styles for Asia/Manila', () => {
        expect(formatDate('2026-10-26T15:15:00')).toBe('October 26, 2026, 03:15 PM')
        expect(formatDate('2026-10-25T16:00:00Z')).toBe('October 26, 2026, 12:00 AM')

        expect(formatShortDate('2026-10-26T15:15:00')).toBe('10-26-2026')
        expect(formatShortDate('2026-10-25T16:00:00Z')).toBe('10-26-2026')

        expect(formatSimpleDate('2026-10-26T15:15:00')).toBe('October 26, 2026')
        expect(formatSimpleDate('2026-10-25T16:00:00Z')).toBe('October 26, 2026')

        expect(formatDateTime('2026-10-26T15:15:09')).toBe('10/26/2026 03:15:09 PM')
        expect(formatDateTime('2026-10-25T16:00:00Z')).toBe('10/26/2026 12:00:00 AM')
    })

    it('formats booking time range in Asia/Manila correctly', () => {
        expect(formatBookingTimeRange('2026-10-26T13:00:00+08:00', '2026-10-26T16:00:00+08:00')).toBe(
            '01:00 PM - 04:00 PM'
        )
        expect(formatBookingTimeRange('2026-10-26 08:00:00', '2026-10-26 14:00:00')).toBe('08:00 AM - 02:00 PM')
        expect(formatBookingTimeRange('not-a-date', '2026-10-26 14:00:00')).toBe('')
        expect(formatBookingTimeRange('2026-10-26 08:00:00', '')).toBe('')
        expect(formatBookingTimeRange(null, null)).toBe('')
        expect(formatBookingTimeRange()).toBe('')
    })

    it('formats relative time accurately', () => {
        const now = 1_793_000_000_000
        vi.spyOn(Date, 'now').mockReturnValue(now)

        try {
            expect(formatRelativeTime(new Date(now - 30 * 1000))).toBe('Just now')
            expect(formatRelativeTime(new Date(now - 60 * 1000))).toBe('1 min ago')
            expect(formatRelativeTime(new Date(now - 5 * 60 * 1000))).toBe('5 mins ago')
            expect(formatRelativeTime(new Date(now - 60 * 60 * 1000))).toBe('1 hr ago')
            expect(formatRelativeTime(new Date(now - 3 * 60 * 60 * 1000))).toBe('3 hrs ago')
            expect(formatRelativeTime(new Date(now - 24 * 60 * 60 * 1000))).toBe('Yesterday')
            expect(formatRelativeTime(new Date(now - 3 * 24 * 60 * 60 * 1000))).toBe('3 days ago')
            expect(formatRelativeTime('')).toBe('')
            expect(formatRelativeTime('not-a-date')).toBe('')
        } finally {
            vi.restoreAllMocks()
        }
    })

    it('returns empty or fallback values for invalid booking dates', () => {
        expect(getBookingDateKey('not-a-date')).toBe('')
        expect(getBookingDateTimeValue('not-a-date')).toBe('')
        expect(addBookingMinutes('not-a-date', 60)).toBe('')
        expect(getNextBookingHourValue('not-a-date')).toBe('')
        expect(formatDate('not-a-date')).toBe('not-a-date')
        expect(formatDate(null)).toBe('')
        expect(formatShortDate('not-a-date')).toBe('')
        expect(formatSimpleDate('not-a-date')).toBe('---')
        expect(formatDateTime('not-a-date')).toBe('---')
    })
})
