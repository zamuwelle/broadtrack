import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { LoginForm } from '@/features/auth/components/LoginForm'

const initialForm = { email: '', password: '' }

describe('LoginForm', () => {
    it('shows validation feedback and does not submit invalid credentials', async () => {
        const onSubmit = vi.fn()
        const { container } = render(<LoginForm form={initialForm} onSubmit={onSubmit} />)

        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => expect(screen.queryByText('This field is required')).not.toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits valid La Verdad credentials once', async () => {
        const onSubmit = vi.fn()
        const { container } = render(<LoginForm form={initialForm} onSubmit={onSubmit} />)
        const emailInput = container.querySelector('input[type="email"]')
        const passwordInput = container.querySelector('input[type="password"]')

        fireEvent.change(emailInput, {
            target: { value: 'student@student.laverdad.edu.ph' }
        })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit).toHaveBeenCalledWith(
            { email: 'student@student.laverdad.edu.ph', password: 'password123' },
            expect.anything()
        )
    })
})
