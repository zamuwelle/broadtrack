export const toTitleCase = (text = '') =>
    text ? String(text).replaceAll(/\S+/gu, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase()) : ''

export const getFullName = (user = {}) => {
    if (!user) {
        return ''
    }
    return toTitleCase(user.full_name || [user.firstname, user.lastname].filter(Boolean).join(' '))
}

export const getFirstName = (user = {}) => {
    if (!user) {
        return ''
    }
    return toTitleCase(user.firstname || '')
}
