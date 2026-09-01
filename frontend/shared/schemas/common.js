import { z } from 'zod'
import { DEPARTMENTS } from '@shared/constants'

export const MAX_NAME_LENGTH = 30
export const MAX_MESSAGE_LENGTH = 6000
export const MAX_PASSWORD_LENGTH = 64
export const MIN_PASSWORD_LENGTH = 8

export const VALIDATION_MESSAGES = Object.freeze({
    REQUIRED: 'This field is required',
    MISSING_FIELDS: 'Please fill missing field/s before to proceed.',
    INVALID_INPUT: 'Invalid input',
    INVALID_EMAIL: 'Invalid email address',
    LA_VERDAD_EMAIL: 'Only La Verdad emails allowed',
    LA_VERDAD_EMAIL_PROMPT: 'Please use a valid La Verdad email address.',
    INVALID_PHONE: 'Invalid phone number',
    PHONE_PREFIX: 'Must start with 09 or +639',
    PHONE_DIGITS_ONLY: 'Numbers only',
    PASSWORD_MIN: 'The password must be at least 8 characters.',
    PASSWORD_MAX: 'Password must not exceed 64 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    NAME_MAX: `Must not exceed ${MAX_NAME_LENGTH} characters`,
    MESSAGE_MAX: `Must not exceed ${MAX_MESSAGE_LENGTH} characters`,
    INVALID_DEPARTMENT: 'Invalid department'
})

const NAME_REGEX = /^[\p{L}\p{M}\s'.-]+$/u

export const nameSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(MAX_NAME_LENGTH, VALIDATION_MESSAGES.NAME_MAX)
    .regex(NAME_REGEX, VALIDATION_MESSAGES.INVALID_INPUT)

export const anyEmailSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)

export const laVerdadEmailSchema = anyEmailSchema.refine(
    (email) => /^[^\s@]+@(?:student\.)?laverdad\.edu\.ph$/iu.test(email),
    { message: VALIDATION_MESSAGES.LA_VERDAD_EMAIL }
)

export const phoneSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .superRefine((val, ctx) => {
        const cleaned = val.replaceAll(/[\s\-()]/gu, '')
        if (!/^\+?\d+$/u.test(cleaned)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION_MESSAGES.PHONE_DIGITS_ONLY })
            return
        }
        if (!/^(?:0|\+?63)/u.test(cleaned)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION_MESSAGES.PHONE_PREFIX })
            return
        }
        const localPart = cleaned.replace(/^\+?63|^0/u, '')
        if (!/^\d{10}$/u.test(localPart)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION_MESSAGES.INVALID_PHONE })
        }
    })

export const passwordSchema = z
    .string()
    .min(MIN_PASSWORD_LENGTH, VALIDATION_MESSAGES.PASSWORD_MIN)
    .max(MAX_PASSWORD_LENGTH, VALIDATION_MESSAGES.PASSWORD_MAX)

export const departmentSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .refine((val) => DEPARTMENTS.includes(val), {
        message: VALIDATION_MESSAGES.INVALID_DEPARTMENT
    })

export const messageSchema = z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(MAX_MESSAGE_LENGTH, VALIDATION_MESSAGES.MESSAGE_MAX)

export const validate = (schema, data) => {
    const result = schema.safeParse(data)
    if (result.success) {
        return { success: true, data: result.data, errors: {} }
    }

    const errors = {}
    for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field && !errors[field]) {
            errors[field] = issue.message
        }
    }

    return { success: false, data: null, errors }
}

export const validateField = (schema, value) => {
    const result = schema.safeParse(value)
    return result.success ? '' : result.error.issues[0]?.message || ''
}

export const validateName = (val) => validateField(nameSchema, val)
export const validateEmail = (val) => validateField(laVerdadEmailSchema, val)
export const validateAnyEmail = (val) => validateField(anyEmailSchema, val)
export const validatePhone = (val) => validateField(phoneSchema, val)
export const validatePassword = (val) => validateField(passwordSchema, val)
export const validateDepartment = (val) => validateField(departmentSchema, val)
export const validateMessage = (val) => validateField(messageSchema, val)
export const validateConfirmPassword = (pw, confirm) =>
    confirm && pw !== confirm ? VALIDATION_MESSAGES.PASSWORD_MISMATCH : ''

export const isValidName = (val) => nameSchema.safeParse(val).success
export const isValidEmail = (val) => laVerdadEmailSchema.safeParse(val).success
export const isValidAnyEmail = (val) => anyEmailSchema.safeParse(val).success
export const isValidPhone = (val) => phoneSchema.safeParse(val).success
export const isValidPassword = (val) => passwordSchema.safeParse(val).success
export const isValidDepartment = (val) => departmentSchema.safeParse(val).success
export const isValidMessage = (val) => messageSchema.safeParse(val).success
