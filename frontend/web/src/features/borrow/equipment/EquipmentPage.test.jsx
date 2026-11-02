import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { EquipmentPage } from '@/features/borrow/equipment/EquipmentPage'

vi.mock('@/features/equipment/api/get-equipment', () => ({
    useEquipment: () => ({
        data: [
            {
                id: 1,
                name: 'Canon Camera',
                brand: 'Canon',
                model: 'M50',
                category: 'Camera'
            },
            {
                id: 2,
                name: 'Studio Tripod',
                brand: 'Manfrotto',
                model: 'Tripod',
                category: 'Support'
            }
        ],
        isLoading: false,
        isError: false
    })
}))
vi.mock('./components/EquipmentCard', () => ({
    EquipmentCard: ({ equipment }) => <div>{equipment.name}</div>
}))

describe('EquipmentPage', () => {
    it('shows equipment and filters it by search text', () => {
        render(<EquipmentPage />)

        expect(screen.getByText('Canon Camera')).toBeInTheDocument()
        expect(screen.getByText('Studio Tripod')).toBeInTheDocument()

        fireEvent.change(screen.getByPlaceholderText('Search camera, lenses, mics, lights...'), {
            target: { value: 'canon' }
        })

        expect(screen.getByText('Canon Camera')).toBeInTheDocument()
        expect(screen.queryByText('Studio Tripod')).not.toBeInTheDocument()
    })

    it('shows the empty state when no equipment matches', () => {
        render(<EquipmentPage />)

        fireEvent.change(screen.getByPlaceholderText('Search camera, lenses, mics, lights...'), {
            target: { value: 'not-found' }
        })

        expect(screen.getByText('No equipment found')).toBeInTheDocument()
    })
})
