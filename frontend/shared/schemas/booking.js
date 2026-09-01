import { z } from 'zod'
import { VALIDATION_MESSAGES } from '@shared/schemas/common'

export const bookingSchema = z
    .object({
        purpose: z.string().trim().min(5, 'Purpose must be at least 5 characters').max(255),
        start_date: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
        end_date: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
        equipment_ids: z.array(z.number()).min(1, 'Please select at least 1 equipment item'),
        notes: z.string().optional()
    })
    .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
        message: 'Start date must be before or equal to end date',
        path: ['end_date']
    })
