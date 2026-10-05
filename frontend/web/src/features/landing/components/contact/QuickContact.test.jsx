import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it } from 'vite-plus/test'
import { QuickContact } from '@/features/landing/components/contact/QuickContact'

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
