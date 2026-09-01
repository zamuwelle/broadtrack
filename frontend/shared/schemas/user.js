import { z } from 'zod'
import { ROLES } from '@shared/constants'
import {
    departmentSchema,
    laVerdadEmailSchema,
    nameSchema,
    passwordSchema,
    phoneSchema
} from '@shared/schemas/common'

const roleEnumValues = [ROLES.BORROWER, ROLES.ADMIN, ROLES.SYSADMIN]

export const createUserSchema = z
    .object({
        firstname: nameSchema,
        lastname: nameSchema,
        email: laVerdadEmailSchema,
        phone: phoneSchema,
        department: departmentSchema.nullable().optional().or(z.literal('')),
        role: z.enum(roleEnumValues).default(ROLES.BORROWER),
        password: passwordSchema
    })
    .refine((data) => data.role !== ROLES.BORROWER || Boolean(data.department), {
        message: 'Department is required for borrowers',
        path: ['department']
    })

export const updateUserSchema = z
    .object({
        firstname: nameSchema,
        lastname: nameSchema,
        email: laVerdadEmailSchema,
        phone: phoneSchema,
        department: departmentSchema.nullable().optional().or(z.literal('')),
        role: z.enum(roleEnumValues).optional(),
        password: z.union([passwordSchema, z.literal('')]).optional()
    })
    .refine((data) => data.role !== ROLES.BORROWER || Boolean(data.department), {
        message: 'Department is required for borrowers',
        path: ['department']
    })

export const updateProfileSchema = z.object({
    firstname: nameSchema,
    lastname: nameSchema,
    phone: phoneSchema,
    department: departmentSchema
})
