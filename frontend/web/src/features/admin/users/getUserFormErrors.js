import {
    validateDepartment,
    validateEmail,
    validateName,
    validatePassword,
    validatePhone
} from '@shared/schemas/common'

export const getUserFormErrors = (form, isBorrower) => ({
    firstname: form.firstname ? validateName(form.firstname) : '',
    lastname: form.lastname ? validateName(form.lastname) : '',
    email: form.error || (form.email ? validateEmail(form.email) : ''),
    phone: form.phone ? validatePhone(form.phone) : '',
    password: form.password ? validatePassword(form.password) : '',
    department: isBorrower && form.department ? validateDepartment(form.department) : ''
})
