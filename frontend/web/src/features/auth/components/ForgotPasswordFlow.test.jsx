import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vite-plus/test'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { AppProvider } from '@/app/provider'
import { api } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({ api: { post: vi.fn() }, setUnauthorizedHandler: vi.fn() }))

it('returns to sign in and shows a toast after sending the reset link', async () => {
    api.post.mockResolvedValueOnce({ message: 'Reset link sent' })
    render(
        <AppProvider>
            <MemoryRouter>
                <AuthModal isOpen mode="forgot" />
            </MemoryRouter>
        </AppProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'student@student.laverdad.edu.ph' }
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByText('Reset link sent! Check your inbox.')).toBeInTheDocument()
    expect(screen.queryByText('Check Your Inbox')).not.toBeInTheDocument()
})

it('keeps the forgot password form open on a server error', async () => {
    api.post.mockRejectedValueOnce({
        status: 500,
        message: 'Could not send reset link.'
    })
    render(
        <AppProvider>
            <MemoryRouter>
                <AuthModal isOpen mode="forgot" />
            </MemoryRouter>
        </AppProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'student@student.laverdad.edu.ph' }
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText('Could not send reset link.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
})
