import { equipmentCategories } from '@shared/data/equipmentCategories'

export const getEquipmentTitle = (equipment = {}) => equipment.brand || equipment.name || 'Equipment'

export const getEquipmentStatus = (equipment) => {
    if (!equipment) {
        return 'available'
    }
    if (typeof equipment !== 'object') {
        return String(equipment).toLowerCase()
    }
    const { status } = equipment
    const statusValue = status && typeof status === 'object' ? status.value : status
    return String(statusValue || 'available').toLowerCase()
}

export const getEquipmentCategory = (equipment = {}) => {
    const { category } = equipment
    let categoryName = null
    if (category && typeof category === 'object') {
        categoryName = category.name
    } else if (typeof category === 'string') {
        categoryName = category
    }
    const fallbackCategory = equipment.category_id ? equipmentCategories[equipment.category_id - 1] : null
    return categoryName || fallbackCategory || 'Support'
}
