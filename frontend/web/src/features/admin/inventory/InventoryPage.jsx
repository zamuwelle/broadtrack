import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/ui/CategoryButtons'
import { InventoryGrid } from '@/features/admin/inventory/components/InventoryGrid'
import { EquipmentModal } from '@/features/admin/inventory/components/EquipmentModal'
import { DeleteEquipmentModal } from '@/features/admin/inventory/components/DeleteEquipmentModal'
import { useEquipment } from '@/api/equipment/get-equipment'
import { updateEquipment } from '@/api/equipment/update-equipment'
import { useSetState } from '@shared/hooks/useSetState'
import { matchesSearch } from '@shared/util/search'
import { EQUIPMENT_CATEGORIES } from '@shared/constants'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

const CATEGORIES = Object.freeze(
    EQUIPMENT_CATEGORIES.map((categoryName) =>
        Object.freeze({
            id: categoryName,
            name: categoryName
        })
    )
)

const ALL_CATEGORIES = Object.freeze(['All', ...EQUIPMENT_CATEGORIES])

const INITIAL_PAGE_STATE = Object.freeze({
    searchText: '',
    selectedCategory: 'All',
    selectedEquipment: null,
    isEquipmentModalOpen: false,
    deletingEquipment: null
})

const useInventoryModals = (updatePageState, queryClient) => {
    const handleOpenAddModal = useCallback(
        () =>
            updatePageState({
                selectedEquipment: null,
                isEquipmentModalOpen: true
            }),
        [updatePageState]
    )

    const handleOpenEditEquipmentModal = useCallback(
        (itemToEdit) =>
            updatePageState({
                selectedEquipment: itemToEdit,
                isEquipmentModalOpen: true
            }),
        [updatePageState]
    )

    const handleOpenDeleteEquipmentModal = useCallback(
        (itemToDelete) =>
            updatePageState({
                deletingEquipment: itemToDelete
            }),
        [updatePageState]
    )

    const handleCloseEquipmentModal = useCallback(
        () =>
            updatePageState({
                isEquipmentModalOpen: false,
                selectedEquipment: null
            }),
        [updatePageState]
    )

    const handleCloseDeleteModal = useCallback(() => updatePageState({ deletingEquipment: null }), [updatePageState])

    const handleRefresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ['equipment'] }), [queryClient])

    return {
        handleOpenAddModal,
        handleOpenEditEquipmentModal,
        handleOpenDeleteEquipmentModal,
        handleCloseEquipmentModal,
        handleCloseDeleteModal,
        handleRefresh
    }
}

export const InventoryPage = (props) => {
    useDocumentTitle('Inventory Management')
    const { equipment: propEquipment } = props

    const queryClient = useQueryClient()
    const { data: hookEquipment = [] } = useEquipment()

    const equipmentList = propEquipment ?? hookEquipment
    const [pageState, updatePageState] = useSetState(INITIAL_PAGE_STATE)
    const { searchText, selectedCategory, selectedEquipment, isEquipmentModalOpen, deletingEquipment } = pageState

    const handleSearchChange = useCallback(
        (newSearchText) => updatePageState({ searchText: newSearchText }),
        [updatePageState]
    )

    const handleCategorySelect = useCallback(
        (newCategory) => updatePageState({ selectedCategory: newCategory }),
        [updatePageState]
    )

    const modals = useInventoryModals(updatePageState, queryClient)

    const filteredEquipment = useMemo(
        () =>
            equipmentList.filter((equipment) => {
                const categoryName =
                    typeof equipment.category === 'string' ? equipment.category : equipment.category?.name || ''
                return (
                    (selectedCategory === 'All' || categoryName === selectedCategory) &&
                    matchesSearch(equipment, searchText)
                )
            }),
        [equipmentList, selectedCategory, searchText]
    )

    const handleUpdateStatus = useCallback(
        async (equipmentId, newStatus) => {
            queryClient.setQueryData(['equipment'], (current) => {
                if (!Array.isArray(current)) {
                    return current
                }
                return current.map((item) => (item.id === equipmentId ? { ...item, status: newStatus } : item))
            })
            try {
                await updateEquipment({ id: equipmentId, data: { status: newStatus } })
            } catch (error) {
                console.error('Failed to update equipment status:', error)
                await queryClient.invalidateQueries({ queryKey: ['equipment'] })
            }
        },
        [queryClient]
    )

    return (
        <div className="flex flex-col font-['Poppins']">
            <div className="mt-[42px] flex flex-col gap-[16px]">
                <SearchInput
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search gear inventory by name, serial, or model..."
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <CategoryButtons
                        categories={ALL_CATEGORIES}
                        selected={selectedCategory}
                        onSelect={handleCategorySelect}
                    />
                    <button
                        type="button"
                        onClick={modals.handleOpenAddModal}
                        className="h-[38px] px-5 bg-sky-800 hover:bg-sky-900 transition-colors rounded-[8px] text-white text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 w-full sm:w-auto">
                        + Add Equipment
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <InventoryGrid
                    equipment={filteredEquipment}
                    onEdit={modals.handleOpenEditEquipmentModal}
                    onDelete={modals.handleOpenDeleteEquipmentModal}
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>

            <EquipmentModal
                isOpen={isEquipmentModalOpen}
                onClose={modals.handleCloseEquipmentModal}
                equipment={selectedEquipment}
                categories={CATEGORIES}
                onSuccess={modals.handleRefresh}
            />

            <DeleteEquipmentModal
                isOpen={Boolean(deletingEquipment)}
                onClose={modals.handleCloseDeleteModal}
                equipment={deletingEquipment}
                onSuccess={modals.handleRefresh}
            />
        </div>
    )
}
