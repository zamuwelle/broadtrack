import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vite-plus/test'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { api } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({ api: { post: vi.fn() } }))

const data = { email: 'student@student.laverdad.edu.ph', token: 'test-token' }
const renderReset = () =>
    render(
        <StrictMode>
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <MemoryRouter>
                    <AuthModal isOpen mode="reset" initialData={data} />
                </MemoryRouter>
            </QueryClientProvider>
        </StrictMode>
    )

it('opens the reset form for a valid link', async () => {
    api.post.mockResolvedValueOnce({ data: { valid: true } })
    renderReset()
    expect(await screen.findByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/check-reset-token', data, { timeout: 10_000 })
})

it('opens forgot password with a warning for an invalid link', async () => {
    api.post.mockResolvedValueOnce({ data: { valid: false } })
    renderReset()
    expect(await screen.findByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
    expect(await screen.findByText('Invalid or expired reset link. Please request a new one.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('')
})

it('reports a connection failure without calling the link invalid', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'))
    renderReset()
    expect(await screen.findByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
    expect(await screen.findByText('Could not check the reset link. Please try again.')).toBeInTheDocument()
})

it('returns to forgot password if the link expires before submission', async () => {
    api.post.mockResolvedValueOnce({ data: { valid: true } })
    api.post.mockRejectedValueOnce({ status: 422, message: 'Invalid or expired reset token.' })
    const { container } = renderReset()
    await screen.findByRole('heading', { name: 'Reset Password' })
    const inputs = container.querySelectorAll('input[type="password"]')
    fireEvent.change(inputs[0], { target: { value: 'password123' } })
    fireEvent.change(inputs[1], { target: { value: 'password123' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm Password' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Password' }))
    expect(await screen.findByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
    expect(await screen.findByText('Invalid or expired reset link. Please request a new one.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('')
})
