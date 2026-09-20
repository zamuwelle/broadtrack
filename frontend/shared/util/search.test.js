import { describe, expect, it } from 'vite-plus/test'
import { matchesBookingSearch, matchesSearch, matchesUserSearch } from '@shared/util/search'

describe('search helpers', () => {
    it('matches all terms across equipment fields', () => {
        expect(matchesSearch({ name: 'Canon Camera', brand: 'Canon', model: 'M50' }, 'canon m50')).toBe(true)
        expect(matchesSearch({ name: 'Canon Camera' }, 'tripod')).toBe(false)
    })

    it('matches booking equipment and user fields', () => {
        const booking = {
            id: 42,
            ticket_id: 'BT-42',
            purpose: 'Student documentary',
            user: { full_name: 'Maria Santos', email: 'maria@student.laverdad.edu.ph' },
            equipments: [{ name: 'Camera', model: 'M50', serial_no: 'CAM-1', brand: 'Canon' }]
        }

        expect(matchesBookingSearch(booking, 'maria')).toBe(true)
        expect(matchesBookingSearch(booking, 'cam-1')).toBe(true)
        expect(matchesBookingSearch(booking, 'not-found')).toBe(false)
    })

    it('matches users case-insensitively and accepts empty queries', () => {
        const user = {
            full_name: 'Maria Santos',
            firstname: 'Maria',
            lastname: 'Santos',
            email: 'maria@student.laverdad.edu.ph',
            role: 'borrower',
            department: 'BS Information Technology'
        }

        expect(matchesUserSearch(user, 'SANTOS')).toBe(true)
        expect(matchesUserSearch(user, '')).toBe(true)
        expect(matchesUserSearch(user, 'admin')).toBe(false)
    })
})
