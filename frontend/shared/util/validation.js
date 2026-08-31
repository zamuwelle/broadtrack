import { DEPARTMENTS } from '@shared/constants'

export const MAX_NAME_LENGTH = 30
export const MAX_MESSAGE_LENGTH = 6000
export const MAX_PASSWORD_LENGTH = 64
export const MIN_PASSWORD_LENGTH = 8

export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    MISSING_FIELDS: 'Please fill missing field/s before to proceed.',
    INVALID_INPUT: 'Invalid input',
    INVALID_EMAIL: 'Invalid email address',
    LA_VERDAD_EMAIL: 'Only La Verdad emails allowed',
    LA_VERDAD_EMAIL_PROMPT: 'Please use a valid La Verdad email address.',
    INVALID_PHONE: 'Invalid phone number',
    PHONE_PREFIX: 'Must start with 09 or +639',
    PHONE_DIGITS_ONLY: 'Numbers only',
    PASSWORD_MIN: 'The password must be at least 8 characters.',
    PASSWORD_MAX: 'Password must not exceed 64 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    NAME_MAX: `Must not exceed ${MAX_NAME_LENGTH} characters`,
    MESSAGE_MAX: `Must not exceed ${MAX_MESSAGE_LENGTH} characters`,
    INVALID_DEPARTMENT: 'Invalid department'
}

const NAME_REGEX = /^[\p{L}\p{M}\s'.-]+$/u

export const getNameError = (name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) {
        return VALIDATION_MESSAGES.REQUIRED
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
        return VALIDATION_MESSAGES.NAME_MAX
    }
    if (!NAME_REGEX.test(trimmed)) {
        return VALIDATION_MESSAGES.INVALID_INPUT
    }
    return ''
}

export const getFirstnameError = (name) => getNameError(name)
export const getLastnameError = (name) => getNameError(name)

export const getMessageError = (message) => {
    const trimmed = (message || '').trim()
    if (!trimmed) {
        return VALIDATION_MESSAGES.REQUIRED
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
        return VALIDATION_MESSAGES.MESSAGE_MAX
    }
    return ''
}

export const getEmailError = (email) => {
    const trimmed = (email || '').trim()
    if (!trimmed) {
        return ''
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(trimmed)) {
        return VALIDATION_MESSAGES.INVALID_EMAIL
    }
    if (!/^[^\s@]+@(?:student\.)?laverdad\.edu\.ph$/iu.test(trimmed)) {
        return VALIDATION_MESSAGES.LA_VERDAD_EMAIL
    }
    return ''
}

export const getAnyEmailError = (email) => {
    const trimmed = (email || '').trim()
    if (!trimmed) {
        return VALIDATION_MESSAGES.REQUIRED
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(trimmed)) {
        return VALIDATION_MESSAGES.INVALID_EMAIL
    }
    return ''
}

export const getPhoneError = (phone) => {
    const trimmed = (phone || '').trim()
    if (!trimmed) {
        return VALIDATION_MESSAGES.REQUIRED
    }
    const cleaned = trimmed.replaceAll(/[\s\-()]/gu, '')
    if (!/^\+?\d+$/u.test(cleaned)) {
        return VALIDATION_MESSAGES.PHONE_DIGITS_ONLY
    }
    if (!/^(?:0|\+?63)/u.test(cleaned)) {
        return VALIDATION_MESSAGES.PHONE_PREFIX
    }
    const localPart = cleaned.replace(/^\+?63|^0/u, '')
    if (/^\d{10}$/u.test(localPart)) {
        return ''
    }
    return VALIDATION_MESSAGES.INVALID_PHONE
}

export const getPasswordError = (password) => {
    if (!password) {
        return ''
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return VALIDATION_MESSAGES.PASSWORD_MIN
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        return VALIDATION_MESSAGES.PASSWORD_MAX
    }
    return ''
}

export const getConfirmPasswordError = (password, confirm) => {
    if (confirm && password !== confirm) {
        return VALIDATION_MESSAGES.PASSWORD_MISMATCH
    }
    return ''
}

export const getRequiredError = (value) => {
    if ((value || '').trim()) {
        return ''
    }
    return VALIDATION_MESSAGES.REQUIRED
}

export const getDepartmentError = (department) => {
    const value = (department || '').trim()
    if (!value) {
        return VALIDATION_MESSAGES.REQUIRED
    }
    if (DEPARTMENTS.includes(value)) {
        return ''
    }
    return VALIDATION_MESSAGES.INVALID_DEPARTMENT
}

export const isValidEmail = (email) => Boolean(email) && !getEmailError(email)

export const isValidPhone = (phone) => Boolean(phone) && !getPhoneError(phone)

export const isValidName = (name) => !getNameError(name)

export const isValidPassword = (password) =>
    Boolean(password && password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH)

export const isValidLoginForm = (form = {}) => {
    const { email = '', password = '' } = form
    return isValidEmail(email) && isValidPassword(password)
}

export const isValidRegisterForm = (form = {}) => {
    const { firstname = '', lastname = '', email = '', phone = '', department = '', password = '' } = form
    return (
        isValidName(firstname) &&
        isValidName(lastname) &&
        isValidEmail(email) &&
        isValidPhone(phone) &&
        Boolean(department.trim()) &&
        isValidPassword(password)
    )
}

export const isValidForgotForm = (form = {}) => {
    const { email = '' } = form
    return isValidEmail(email)
}

export const isValidResetForm = (form = {}) => {
    const { password = '', confirmPassword = '', token = '' } = form
    return isValidPassword(password) && password === confirmPassword && Boolean(token)
}

export const formatPhone = (phone) => {
    if (!phone) {
        return ''
    }
    const hasPlus = phone.startsWith('+')
    const digits = phone.replaceAll(/\D/gu, '')

    if (hasPlus || digits.startsWith('63')) {
        if (digits.startsWith('63')) {
            const prefix = hasPlus ? '+63' : '63'
            const raw = digits.slice(2)
            let result = prefix
            if (raw.length > 0) {
                result = `${result} ${raw.slice(0, 3)}`
            }
            if (raw.length > 3) {
                result = `${result} ${raw.slice(3, 6)}`
            }
            if (raw.length > 6) {
                result = `${result} ${raw.slice(6, 10)}`
            }
            return result
        }
        return `+${digits.slice(0, 12)}`
    }

    let result = digits.slice(0, 4)
    if (digits.length > 4) {
        result = `${result} ${digits.slice(4, 7)}`
    }
    if (digits.length > 7) {
        result = `${result} ${digits.slice(7, 11)}`
    }
    return result
}
