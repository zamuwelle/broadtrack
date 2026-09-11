import { validateDepartment, validateEmail, validateName, validatePassword } from '@shared/schemas/common'

export const getUserFormErrors = (form, isBorrower) => ({
    firstname: form.firstname ? validateName(form.firstname) : '',
    lastname: form.lastname ? validateName(form.lastname) : '',
    email: form.error || (form.email ? validateEmail(form.email) : ''),
    password: form.password ? validatePassword(form.password) : '',
    department: isBorrower && form.department ? validateDepartment(form.department) : ''
})
