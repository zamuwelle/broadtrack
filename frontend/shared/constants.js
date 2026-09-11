export const DEPARTMENTS = Object.freeze([
    'BA Broadcasting',
    'BS Information Systems',
    'Associate in Computer Technology',
    'BS Accountancy',
    'BS Accountancy in Information Systems',
    'BS Social Work'
])

export const DEPARTMENT_SHORTHANDS = Object.freeze({
    'BA Broadcasting': 'BAB',
    'BS Information Systems': 'BSIS',
    'Associate in Computer Technology': 'ACT',
    'BS Accountancy': 'BSA',
    'BS Accountancy in Information Systems': 'BSAIS',
    'BS Social Work': 'BSSW'
})

export const EQUIPMENT_CATEGORIES = Object.freeze([
    'Camera',
    'Video',
    'Audio',
    'Lighting',
    'Support',
    'Cables',
    'Others'
])

export const EQUIPMENT_STATUSES = Object.freeze(['available', 'booked', 'borrowed', 'maintenance'])

export const APPROVAL_STATUSES = Object.freeze(['All', 'Pending', 'Confirmed', 'Rejected', 'Completed'])

export const TRANSACTION_CATEGORIES = Object.freeze(['All', 'Active', 'Completed', 'Overdue', 'Cancelled'])

export const BOOKING_FILTER_OPTIONS = Object.freeze([
    'All Ticket Requests',
    'Approved',
    'Pending',
    'Cancelled',
    'Returned',
    'Rejected'
])

export const ACTIVE_BOOKING_STATUSES = Object.freeze(['pending', 'approved', 'overdue'])

export const EDITABLE_ROLES = Object.freeze(['borrower', 'admin'])

export const ROLES = Object.freeze({
    BORROWER: 'borrower',
    ADMIN: 'admin',
    SYSADMIN: 'sysadmin'
})

export const BORROWER_ROLES = Object.freeze([ROLES.BORROWER])
export const ADMIN_ROLES = Object.freeze([ROLES.ADMIN, ROLES.SYSADMIN])
