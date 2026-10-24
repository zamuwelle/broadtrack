import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vite-plus/test'
import { ProfileInputField } from '@/features/users/components/ProfileInputField'

it('reserves the shared error spacing whether an error is shown or not', () => {
    const field = { key: 'firstname', label: 'First Name', type: 'text' }
    const props = {
        field,
        card: true,
        onValueChange: vi.fn(),
        onErrorChange: vi.fn()
    }
    const { container, rerender } = render(<ProfileInputField {...props} />)
    const errorRow = container.querySelector('.h-4.mt-1')
    expect(errorRow).not.toBeNull()
    expect(errorRow.textContent).toBe('')
    rerender(<ProfileInputField {...props} error="This field is required" />)
    expect(screen.getByText('This field is required').parentElement).toBe(errorRow)
})
