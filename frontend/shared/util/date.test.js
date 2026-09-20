import { describe, expect, it } from 'vite-plus/test'
import { addBookingMinutes, getBookingDateKey, getBookingDateTimeValue } from '@shared/util/date'

describe('booking date helpers', () => {
    it('formats UTC timestamps using the Manila calendar date', () => {
        expect(getBookingDateKey('2026-10-25T16:30:00Z')).toBe('2026-10-26')
        expect(getBookingDateTimeValue('2026-10-25T16:30:00Z')).toBe('2026-10-26T00:30')
    })

    it('adds minutes while preserving the Manila display value', () => {
        expect(addBookingMinutes('2026-10-25T16:30:00Z', 60)).toBe('2026-10-26T01:30')
    })

    it('returns an empty value for invalid booking dates', () => {
        expect(getBookingDateKey('not-a-date')).toBe('')
        expect(getBookingDateTimeValue('not-a-date')).toBe('')
        expect(addBookingMinutes('not-a-date', 60)).toBe('')
    })
})
