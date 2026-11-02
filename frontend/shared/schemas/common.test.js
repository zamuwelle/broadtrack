import { describe, expect, it } from 'vite-plus/test'
import {
    VALIDATION_MESSAGES,
    isValidDepartment,
    validate,
    validateConfirmPassword,
    validateField,
    validateName,
    validatePassword
} from '@shared/schemas/common'

describe('common schemas', () => {
    it('rejects names longer than the configured maximum', () => {
        expect(validateName('a'.repeat(31))).toBe(VALIDATION_MESSAGES.NAME_MAX)
    })

    it('rejects passwords shorter than the configured minimum', () => {
        expect(validatePassword('short')).toBe(VALIDATION_MESSAGES.PASSWORD_MIN)
    })

    it('validates departments against the shared department list', () => {
        expect(isValidDepartment('not-a-department')).toBe(false)
    })

    it('reports the first validation error by field', () => {
        const result = validate(
            {
                safeParse: () => ({
                    success: false,
                    error: {
                        issues: [
                            { path: ['email'], message: 'Invalid email address' },
                            { path: ['email'], message: 'Only La Verdad emails allowed' }
                        ]
                    }
                })
            },
            {}
        )

        expect(result).toEqual({
            success: false,
            data: null,
            errors: { email: 'Invalid email address' }
        })
    })

    it('returns a mismatch only when confirmation differs', () => {
        expect(validateConfirmPassword('password123', 'different123')).toBe(VALIDATION_MESSAGES.PASSWORD_MISMATCH)
        expect(validateConfirmPassword('password123', 'password123')).toBe('')
    })

    it('returns an empty message for a valid field', () => {
        expect(validateField({ safeParse: () => ({ success: true }) }, 'value')).toBe('')
    })
})
