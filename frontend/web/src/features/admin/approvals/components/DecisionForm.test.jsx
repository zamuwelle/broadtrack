import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { DecisionForm } from '@/features/admin/approvals/components/DecisionForm'

const props = {
    isApprove: false,
    text: '',
    errorMessage: '',
    isSubmitting: false,
    borrowerName: 'Test Borrower',
    equipmentName: 'Microphone',
    dateTimeRangeLabel: 'October 30, 2026, 2:00 PM – 4:00 PM',
    onTextChange: vi.fn(),
    onSubmit: vi.fn()
}

describe('DecisionForm', () => {
    it('requires pickup notes before approval', () => {
        const { rerender } = render(<DecisionForm {...props} isApprove />)
        const note = screen.getByRole('textbox', { name: /Pickup Location \/ Cabinet Notes/u })

        expect(note).toBeRequired()
        expect(screen.getByText(/October 30, 2026, 2:00 PM/u)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Approve & Notify' })).toBeDisabled()

        rerender(<DecisionForm {...props} isApprove text="Pick up at DSR 101." />)

        expect(screen.getByRole('button', { name: 'Approve & Notify' })).toBeEnabled()
    })

    it('disables rejection until a non-empty reason is entered', () => {
        const { rerender } = render(<DecisionForm {...props} />)
        const submit = screen.getByRole('button', { name: 'Reject Request' })

        expect(submit).toBeDisabled()

        rerender(<DecisionForm {...props} text="Equipment is under maintenance." />)

        expect(screen.getByRole('button', { name: 'Reject Request' })).toBeEnabled()

        rerender(<DecisionForm {...props} text="   " />)

        expect(screen.getByRole('button', { name: 'Reject Request' })).toBeDisabled()
    })
})
