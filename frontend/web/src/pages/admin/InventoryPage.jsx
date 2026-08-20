import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SearchInput } from '@/components/ui/SearchInput'
import { CategoryButtons } from '@/components/borrow/equipment/CategoryButtons'
import { InventoryGrid } from '@/components/admin/inventory/InventoryGrid'
import { EquipmentModal } from '@/components/admin/inventory/EquipmentModal'
import { DeleteEquipmentModal } from '@/components/admin/inventory/DeleteEquipmentModal'
import { useEquipment } from '@/hooks/queries/useEquipment'
import { useSetState } from '@shared/hooks/useSetState'
import { matchesSearch } from '@shared/util/search'
import { equipmentCategories } from '@shared/data/equipmentCategories'
import { equipmentService } from '@/api'

const categories = Object.freeze(
    equipmentCategories.map((categoryName, categoryIndex) =>
        Object.freeze({
            id: categoryIndex + 1,
            name: categoryName
        })
    )
)

const allCategories = Object.freeze(['All', ...equipmentCategories])

const resolveColumnCount = () => {
    if (!globalThis.window) {
        return 1
    }
    const width = globalThis.window.innerWidth
    if (width >= 2200) {
        return 4
    }
    if (width >= 1536) {
        return 3
    }
    if (width >= 640) {
        return 2
    }
    return 1
}

const initialPageState = Object.freeze({
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

    const handleEdit = useCallback(
        (itemToEdit) =>
            updatePageState({
                selectedEquipment: itemToEdit,
                isEquipmentModalOpen: true
            }),
        [updatePageState]
    )

    const handleDelete = useCallback(
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
        handleEdit,
        handleDelete,
        handleCloseEquipmentModal,
        handleCloseDeleteModal,
        handleRefresh
    }
}

export const InventoryPage = (props) => {
    const { equipment: propEquipment } = props
    const [columnCount, setColumnCount] = useState(resolveColumnCount)

    useEffect(() => {
        const handleResize = () => setColumnCount(resolveColumnCount())
        globalThis.window.addEventListener('resize', handleResize)
        return () => globalThis.window.removeEventListener('resize', handleResize)
    }, [])

    const queryClient = useQueryClient()
    const { data: hookEquipment = [] } = useEquipment()

    const equipmentList = propEquipment ?? hookEquipment
    const [pageState, updatePageState] = useSetState(initialPageState)
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
                const categoryName = equipment.category ? equipment.category.name : ''
                return (
                    (selectedCategory === 'All' || categoryName === selectedCategory) &&
                    matchesSearch(equipment, searchText)
                )
            }),
        [equipmentList, selectedCategory, searchText]
    )

    const columns = useMemo(
        () =>
            Array.from({ length: columnCount }, (_, index) => ({
                id: `inventory-col-${index}`,
                items: filteredEquipment.filter((equipmentItem, itemIndex) => itemIndex % columnCount === index)
            })),
        [columnCount, filteredEquipment]
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
                await equipmentService.update(equipmentId, { status: newStatus })
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
                        categories={allCategories}
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
                    columns={columns}
                    columnCount={columnCount}
                    onEdit={modals.handleEdit}
                    onDelete={modals.handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>

            <EquipmentModal
                isOpen={isEquipmentModalOpen}
                onClose={modals.handleCloseEquipmentModal}
                equipment={selectedEquipment}
                categories={categories}
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
