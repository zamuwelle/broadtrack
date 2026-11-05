import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vite-plus/test'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { AppProvider } from '@/app/provider'
import { loginUser } from '@/features/auth/api/login'

vi.mock('@/features/auth/api/login', () => ({ loginUser: vi.fn() }))

const renderLogin = (initialError = '') =>
    render(
        <StrictMode>
            <AppProvider>
                <MemoryRouter>
                    <AuthModal isOpen initialError={initialError} />
                </MemoryRouter>
            </AppProvider>
        </StrictMode>
    )

it('shows the missing-fields toast without errors under empty inputs', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByText('Please fill missing field/s before to proceed.')).toBeInTheDocument()
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
})

it('does not focus an empty input after clicking Sign In', async () => {
    const { container } = renderLogin()
    const button = screen.getByRole('button', { name: 'Sign In' })
    button.focus()
    fireEvent.click(button)
    await screen.findByText('Please fill missing field/s before to proceed.')
    expect(container.querySelector('input[type="email"]')).not.toHaveFocus()
    expect(container.querySelector('input[type="password"]')).not.toHaveFocus()
})

it('shows a danger toast when Google returns an invalid email error', async () => {
    renderLogin('Please use a valid La Verdad email address.')
    await waitFor(() =>
        expect(document.querySelector(String.raw`.fixed.top-\[96px\]`)).toHaveTextContent(
            'Please use a valid La Verdad email address.'
        )
    )
    expect(document.querySelector(String.raw`.fixed.top-\[96px\] > div`)).toHaveStyle({
        backgroundColor: 'var(--color-danger)'
    })
    expect(screen.getAllByText('Please use a valid La Verdad email address.')).toHaveLength(2)
})

it('shows a field error when an email is outside the La Verdad domains', async () => {
    const { container } = renderLogin()
    fireEvent.change(container.querySelector('input[type="email"]'), {
        target: { value: 'person@example.com' }
    })
    fireEvent.change(container.querySelector('input[type="password"]'), {
        target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByText('Only La Verdad emails allowed')).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
})

it('shows field errors when credentials are rejected', async () => {
    loginUser.mockRejectedValueOnce({
        status: 401,
        message: 'Email or password is incorrect'
    })
    const { container } = renderLogin()
    fireEvent.change(container.querySelector('input[type="email"]'), {
        target: { value: 'person@laverdad.edu.ph' }
    })
    fireEvent.change(container.querySelector('input[type="password"]'), {
        target: { value: 'password123' }
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => expect(screen.getAllByText('Email or password is incorrect')).toHaveLength(2))
})

it('shows network errors in a toast', async () => {
    loginUser.mockRejectedValueOnce({ message: 'Network Error' })
    const { container } = renderLogin()
    const email = container.querySelector('input[type="email"]')
    fireEvent.change(email, { target: { value: 'person@laverdad.edu.ph' } })
    fireEvent.change(container.querySelector('input[type="password"]'), {
        target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => expect(screen.getByText('Network Error')).toBeInTheDocument())
})
