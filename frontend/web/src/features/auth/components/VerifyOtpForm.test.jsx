import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vite-plus/test'
import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm'

it('does not allow verification while a digit is missing', () => {
    render(<VerifyOtpForm email="student@student.laverdad.edu.ph" onSwitchTab={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    for (const [index, input] of inputs.entries()) {
        fireEvent.change(input, { target: { value: String(index + 1) } })
    }
    expect(screen.getByRole('button', { name: 'Verify Code' })).toBeEnabled()
    fireEvent.change(inputs[2], { target: { value: '' } })
    expect(screen.getByRole('button', { name: 'Verify Code' })).toBeDisabled()
})
