import { expect, it } from 'vite-plus/test'
import { MAX_BOOKING_PURPOSE_LENGTH, bookingPurposeSchema } from '@shared/schemas/booking'

it('requires a booking purpose within the server limit', () => {
    expect(bookingPurposeSchema.safeParse('   ').success).toBe(false)
    expect(bookingPurposeSchema.safeParse('a'.repeat(MAX_BOOKING_PURPOSE_LENGTH)).success).toBe(true)
    expect(bookingPurposeSchema.safeParse('a'.repeat(MAX_BOOKING_PURPOSE_LENGTH + 1)).success).toBe(false)
})
