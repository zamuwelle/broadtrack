export const toTitleCase = text => text.replace(/\S+/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase())

export const getFullName = user => {
	const rawName = user?.full_name || [user?.firstname, user?.lastname].filter(Boolean).join(' ')
	return toTitleCase(rawName)
}

export const getFirstName = user => toTitleCase(user?.firstname || '')