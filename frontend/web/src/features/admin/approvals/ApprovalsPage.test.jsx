import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ApprovalsPage } from '@/features/admin/approvals/ApprovalsPage'

const createApprovalHandler = (onApprove, booking) => () => onApprove(booking)

vi.mock('@/features/bookings/api/get-bookings', () => ({
    useBookings: () => ({ data: [], isLoading: false, isError: false })
}))
vi.mock('./components/ApprovalCard', () => ({
    ApprovalCard: ({ booking, onApprove }) => (
        <div>
            <span>{booking.user.full_name}</span>
            <button type="button" onClick={createApprovalHandler(onApprove, booking)}>
                Approve request
            </button>
        </div>
    )
}))
vi.mock('./components/DecisionModal', () => ({
    DecisionModal: ({ isOpen, type, booking }) =>
        isOpen ? <dialog open>{`${type}:${booking?.user?.full_name || 'selected'}`}</dialog> : null
}))
vi.mock('./components/ConfirmReturnModal', () => ({
    ConfirmReturnModal: () => null
}))

const pendingBooking = {
    id: 7,
    status: 'pending',
    user: { full_name: 'Maria Santos', email: 'maria@student.laverdad.edu.ph' },
    equipments: [{ id: 1, name: 'Canon Camera', model: 'M50', serial_no: 'CAM-1', brand: 'Canon' }],
    created_at: '2026-10-26T08:00:00+08:00'
}
const pendingBookings = [pendingBooking]

describe('ApprovalsPage', () => {
    it('shows pending bookings and opens the approval decision modal', () => {
        render(<ApprovalsPage bookings={pendingBookings} />)

        fireEvent.click(screen.getByRole('button', { name: 'Approve request' }))

        expect(screen.getByRole('dialog')).toHaveTextContent('approve:Maria Santos')
    })

    it('shows the empty state when the status filter removes all bookings', () => {
        render(<ApprovalsPage bookings={pendingBookings} />)

        fireEvent.click(screen.getByRole('button', { name: 'Confirmed' }))

        expect(screen.getByText('No matching requests')).toBeInTheDocument()
    })
})
