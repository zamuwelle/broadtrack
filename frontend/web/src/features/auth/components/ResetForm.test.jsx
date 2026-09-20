import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ResetForm } from '@/features/auth/components/ResetForm'

const initialForm = { token: 'reset-token', email: 'student@student.laverdad.edu.ph' }

describe('ResetForm', () => {
    it('shows a mismatch error and does not submit different passwords', async () => {
        const onSubmit = vi.fn()
        const { container } = render(<ResetForm form={initialForm} onSubmit={onSubmit} />)
        const inputs = container.querySelectorAll('input')

        fireEvent.change(inputs[2], { target: { value: 'password123' } })
        fireEvent.change(inputs[3], { target: { value: 'different123' } })
        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => expect(screen.getByText('Passwords do not match')).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('keeps reset context when submitting matching passwords', async () => {
        const onSubmit = vi.fn()
        const { container } = render(<ResetForm form={initialForm} onSubmit={onSubmit} />)
        const inputs = container.querySelectorAll('input')

        fireEvent.change(inputs[2], { target: { value: 'password123' } })
        fireEvent.change(inputs[3], { target: { value: 'password123' } })
        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                token: 'reset-token',
                email: 'student@student.laverdad.edu.ph',
                password: 'password123',
                confirmPassword: 'password123'
            },
            expect.anything()
        )
    })
})
