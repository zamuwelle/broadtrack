export const matchesSearch = (item, searchText) => {
	const search = searchText.trim().toLowerCase()
	if (!search) return true
	return [item.name, item.brand, item.model, item.description, item.specs].some(field => field?.toLowerCase().includes(search))
}