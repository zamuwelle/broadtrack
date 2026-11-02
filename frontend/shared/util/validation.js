import { departments } from '@shared/data/departments'

export const getEmailError = (email) => !email ? '' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Invalid email address' : !/^[^\s@]+@(student\.)?laverdad\.edu\.ph$/i.test(email.trim()) ? 'Only La Verdad emails allowed' : ''

export const getPhoneError = (phone) => {
	if (!phone) return ''
	const cleaned = phone.replace(/[\s\-()]/g, '')
	if (!/^\+?\d+$/.test(cleaned)) return 'Numbers only'
	if (!cleaned.startsWith('0') && !cleaned.startsWith('63') && !cleaned.startsWith('+63')) return 'Must start with 09 or +639'
	const digits = cleaned.replace(/^\+?63/, '').replace(/^0/, '')
	return digits.length < 10 ? 'Invalid phone number' : !/^\d{10}$/.test(digits) ? 'Invalid phone number' : ''
}

export const getPasswordError = (password) => password && password.length < 8 ? 'The password must be at least 8 characters.' : ''

export const getConfirmPasswordError = (password, confirm) => confirm && password !== confirm ? 'Passwords do not match' : ''

export const getRequiredError = (value) => (value || '').trim() ? '' : 'This field is required'

export const getDepartmentError = (department) => {
	const value = (department || '').trim()
	if (!value) return 'This field is required'
	return departments.includes(value) ? '' : 'Invalid department'
}

export const isValidEmail = (email) => Boolean(email) && !getEmailError(email)

export const isValidPhone = (phone) => /^(09|\+?639)\d{9}$/.test((phone || '').replace(/[\s\-()]/g, ''))