import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vite-plus/test'
import { AuthModal } from '@/features/auth/components/AuthModal'

vi.mock('./useAuthModalActions', () => ({
    useAuthModalActions: () => ({
        loginPending: false,
        registerPending: false,
        forgotPending: false,
        resetPending: false,
        verifyPending: false,
        login: vi.fn(),
        register: vi.fn(),
        forgot: vi.fn(),
        reset: vi.fn(),
        verify: vi.fn(),
        resendVerification: vi.fn()
    })
}))

describe('AuthModal', () => {
    it('does not render when it is closed', () => {
        const { container } = render(<AuthModal isOpen={false} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the login form and switches to registration', () => {
        render(
            <MemoryRouter>
                <AuthModal isOpen mode="login" />
            </MemoryRouter>
        )

        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })
})
