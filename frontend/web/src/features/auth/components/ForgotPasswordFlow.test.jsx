import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vite-plus/test'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { api } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({ api: { post: vi.fn() } }))

it('returns to sign in and shows a toast after sending the reset link', async () => {
    api.post.mockResolvedValueOnce({ message: 'Reset link sent' })
    render(
        <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter>
                <AuthModal isOpen mode="forgot" />
            </MemoryRouter>
        </QueryClientProvider>
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
        <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter>
                <AuthModal isOpen mode="forgot" />
            </MemoryRouter>
        </QueryClientProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'student@student.laverdad.edu.ph' }
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText('Could not send reset link.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
})
