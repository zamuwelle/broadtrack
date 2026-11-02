import { z } from 'zod'
import { EDITABLE_ROLES, ROLES } from '@shared/constants'
import { departmentSchema, laVerdadEmailSchema, nameSchema, passwordSchema } from '@shared/schemas/common'

const roleSchema = z.enum(EDITABLE_ROLES)

const withDepartmentRule = (schema) =>
    schema.superRefine((data, context) => {
        if (data.role === ROLES.BORROWER && !data.department) {
            context.addIssue({
                code: 'custom',
                path: ['department'],
                message: 'This field is required'
            })
        }
    })

export const addUserSchema = withDepartmentRule(
    z.object({
        firstname: nameSchema,
        lastname: nameSchema,
        email: laVerdadEmailSchema,
        role: roleSchema,
        department: departmentSchema.or(z.literal('')),
        password: passwordSchema
    })
)

export const editUserSchema = withDepartmentRule(
    z.object({
        firstname: nameSchema,
        lastname: nameSchema,
        email: laVerdadEmailSchema,
        role: roleSchema,
        department: departmentSchema.or(z.literal('')),
        password: z.union([passwordSchema, z.literal('')])
    })
)
