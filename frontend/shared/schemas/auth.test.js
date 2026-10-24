import { describe, expect, it } from 'vite-plus/test'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '@shared/schemas/auth'

const validEmail = 'student@student.laverdad.edu.ph'

describe('auth schemas', () => {
    it('accepts valid login credentials', () => {
        expect(loginSchema.safeParse({ email: validEmail, password: 'password123' }).success).toBe(true)
    })

    it('rejects non-La Verdad email addresses', () => {
        const result = forgotPasswordSchema.safeParse({
            email: 'person@example.com'
        })

        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Only La Verdad emails allowed')
    })

    it('requires matching reset passwords', () => {
        const result = resetPasswordSchema.safeParse({
            token: 'reset-token',
            email: validEmail,
            password: 'password123',
            confirmPassword: 'different123'
        })

        expect(result.success).toBe(false)
        expect(result.error.issues.at(-1).message).toBe('Passwords do not match')
    })

    it('accepts a complete registration payload', () => {
        expect(
            registerSchema.safeParse({
                firstname: 'Maria',
                lastname: 'Santos',
                email: validEmail,
                department: 'BS Information Systems',
                password: 'password123'
            }).success
        ).toBe(true)
    })
})
