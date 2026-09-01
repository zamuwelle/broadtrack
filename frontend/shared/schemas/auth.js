import { z } from 'zod'
import {
    VALIDATION_MESSAGES,
    departmentSchema,
    laVerdadEmailSchema,
    nameSchema,
    passwordSchema,
    phoneSchema
} from '@shared/schemas/common'

export const loginSchema = z.object({
    email: laVerdadEmailSchema,
    password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED)
})

export const registerSchema = z.object({
    firstname: nameSchema,
    lastname: nameSchema,
    email: laVerdadEmailSchema,
    phone: phoneSchema,
    department: departmentSchema,
    password: passwordSchema
})

export const forgotPasswordSchema = z.object({
    email: laVerdadEmailSchema
})

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
        email: laVerdadEmailSchema.optional(),
        password: passwordSchema,
        confirmPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
        path: ['confirmPassword']
    })
