import { z } from 'zod'
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from '@shared/constants'

export const MAX_EQUIPMENT_FIELD_LENGTH = 255

export const equipmentSchema = z.object({
    equipmentName: z
        .string()
        .trim()
        .min(1, 'Equipment name is required')
        .max(MAX_EQUIPMENT_FIELD_LENGTH, 'Must not exceed 255 characters'),
    categoryId: z
        .string()
        .trim()
        .min(1, 'Please select a category')
        .refine((val) => EQUIPMENT_CATEGORIES.includes(val), {
            message: 'Please select a category'
        }),
    shortDescription: z.string().trim().min(1, 'Description is required'),
    modelCode: z
        .string()
        .trim()
        .max(MAX_EQUIPMENT_FIELD_LENGTH, 'Must not exceed 255 characters')
        .optional()
        .or(z.literal('')),
    serialNumber: z
        .string()
        .trim()
        .max(MAX_EQUIPMENT_FIELD_LENGTH, 'Must not exceed 255 characters')
        .optional()
        .or(z.literal('')),
    technicalSpecs: z.string().trim().optional().or(z.literal('')),
    status: z.enum(EQUIPMENT_STATUSES).optional()
})
