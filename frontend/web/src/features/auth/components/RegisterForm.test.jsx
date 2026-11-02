import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

const initialForm = {
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    password: ''
}

describe('RegisterForm', () => {
    it('blocks submission while required fields are invalid', () => {
        const onSubmit = vi.fn()
        const { container } = render(<RegisterForm form={initialForm} onSubmit={onSubmit} />)

        fireEvent.submit(container.querySelector('form'))

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits valid registration data after selecting a department', async () => {
        const onSubmit = vi.fn()
        const { container } = render(<RegisterForm form={initialForm} onSubmit={onSubmit} />)
        const inputs = container.querySelectorAll('input')

        fireEvent.change(inputs[0], { target: { value: 'Maria' } })
        fireEvent.change(inputs[1], { target: { value: 'Santos' } })
        fireEvent.change(inputs[2], {
            target: { value: 'student@student.laverdad.edu.ph' }
        })
        fireEvent.click(screen.getByRole('button', { name: 'Select Department' }))
        fireEvent.click(screen.getByRole('button', { name: 'BS Information Systems' }))
        fireEvent.change(inputs[3], { target: { value: 'password123' } })
        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit).toHaveBeenCalledWith(
            {
                firstname: 'Maria',
                lastname: 'Santos',
                email: 'student@student.laverdad.edu.ph',
                department: 'BS Information Systems',
                password: 'password123'
            },
            expect.anything()
        )
    })
})
