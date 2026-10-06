import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vite-plus/test'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

it('keeps the dialog open on backdrop clicks and closes it with the X', () => {
    const onClose = vi.fn()
    const { container } = render(<ConfirmModal isOpen title="Confirm" onClose={onClose} />)

    fireEvent.click(container.querySelector('[aria-hidden="true"]'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
})
