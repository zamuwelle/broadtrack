import { createApi } from '@shared/api/client'
import { makeAuth } from '@shared/api/auth'
import { makeContact } from '@shared/api/contact'
import { makeEquipment } from '@shared/api/equipment'
import { makeBookings } from '@shared/api/bookings'
import { makeUsers } from '@shared/api/users'

const api = createApi(import.meta.env.VITE_API_URL, () => localStorage.getItem('auth_token'))

export const authService = makeAuth(api)
export const contactService = makeContact(api)
export const equipmentService = makeEquipment(api)
export const bookingService = makeBookings(api)
export const userService = makeUsers(api)
