import { z } from 'zod'
import { VALIDATION_MESSAGES } from '@shared/schemas/common'

export const MAX_BOOKING_PURPOSE_LENGTH = 255
export const bookingPurposeSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(MAX_BOOKING_PURPOSE_LENGTH)
