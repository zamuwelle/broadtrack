import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vite-plus/test'
import { QuickContact } from '@/features/landing/components/contact/QuickContact'
import { ContactFormView } from '@/features/landing/components/contact/ContactFormView'

const noErrors = Object.freeze({})
const requestError = Object.freeze({ message: 'Network Error' })

it('keeps contact fields inactive until the panel is opened', () => {
    render(
        <QueryClientProvider client={new QueryClient()}>
            <QuickContact />
        </QueryClientProvider>
    )

    const field = screen.getByPlaceholderText('* First Name')
    expect(field.closest('[inert]')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open Contact Panel' }))
    expect(field.closest('[inert]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Close Contact Panel' }))
    expect(field.closest('[inert]')).not.toBeNull()
})

it('shows a request error above the contact fields', () => {
    render(<ContactFormView register={vi.fn(() => ({}))} errors={noErrors} error={requestError} />)
    const error = screen.getByText('Network Error')
    expect(error.parentElement.firstElementChild).toBe(error)
})
