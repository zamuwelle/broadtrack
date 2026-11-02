export const makeEquipment = (api) => ({
	list: () => api.get('/equipment'),
})