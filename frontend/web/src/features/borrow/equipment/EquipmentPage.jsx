import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banner } from '@/components/ui/Banner'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryButtons } from '@/components/ui/CategoryButtons'
import { EquipmentCard } from '@/features/borrow/equipment/components/EquipmentCard'
import { useEquipment } from '@/features/equipment/api/get-equipment'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'
import { useSetState } from '@shared/hooks/useSetState'
import { matchesSearch } from '@shared/util/search'
import { EQUIPMENT_CATEGORIES } from '@shared/constants'

const CATEGORY_OPTIONS = Object.freeze(['All', ...EQUIPMENT_CATEGORIES])
const DEFAULT_EQUIPMENT_LIST = Object.freeze([])

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

const GRID_CLASS_MAP = Object.freeze({
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
})

export const EquipmentPage = () => {
    useDocumentTitle('Equipment Catalog')
    const [columnCount, setColumnCount] = useState(resolveColumnCount)

    useEffect(() => {
        const handleResize = () => setColumnCount(resolveColumnCount())
        globalThis.window.addEventListener('resize', handleResize)
        return () => globalThis.window.removeEventListener('resize', handleResize)
    }, [])

    const [filterState, updateFilterState] = useSetState({
        category: 'All',
        searchText: ''
    })
    const { category, searchText } = filterState
    const { data: equipment = DEFAULT_EQUIPMENT_LIST, isLoading, isError } = useEquipment()

    const handleSearchChange = useCallback(
        (newSearchText) => {
            updateFilterState({ searchText: newSearchText })
        },
        [updateFilterState]
    )

    const handleCategorySelect = useCallback(
        (newCategory) => {
            updateFilterState({ category: newCategory })
        },
        [updateFilterState]
    )

    const filteredEquipment = useMemo(
        () =>
            equipment.filter((item) => {
                const categoryName = typeof item.category === 'string' ? item.category : item.category?.name || ''
                return (category === 'All' || categoryName === category) && matchesSearch(item, searchText)
            }),
        [category, equipment, searchText]
    )

    const columns = useMemo(
        () =>
            [
                {
                    id: 'col-0',
                    items: filteredEquipment.filter((item, i) => i % columnCount === 0)
                },
                {
                    id: 'col-1',
                    items: filteredEquipment.filter((item, i) => i % columnCount === 1)
                },
                {
                    id: 'col-2',
                    items: filteredEquipment.filter((item, i) => i % columnCount === 2)
                },
                {
                    id: 'col-3',
                    items: filteredEquipment.filter((item, i) => i % columnCount === 3)
                }
            ].slice(0, columnCount),
        [columnCount, filteredEquipment]
    )

    const hasEquipment = !isLoading && filteredEquipment.length > 0
    const hasNoEquipment = !isLoading && !isError && filteredEquipment.length === 0

    return (
        <div className="flex flex-col font-['Poppins']">
            <Banner title="Request BAB Equipment">
                Browse our verified BAB Equipment asset catalog, check date availability,
                <br />
                and book gear instantly. Your booking slip will generate immediately.
            </Banner>
            <div className="mt-[42px] flex flex-col gap-[16px]">
                <SearchInput value={searchText} onChange={handleSearchChange} />
                <CategoryButtons categories={CATEGORY_OPTIONS} selected={category} onSelect={handleCategorySelect} />
            </div>
            <div className="mt-8">
                {hasEquipment ? (
                    <div className={`grid ${GRID_CLASS_MAP[columnCount]} gap-6 items-start`}>
                        {columns.map((column) => (
                            <div key={column.id} className="flex flex-col gap-6">
                                {column.items.map((item) => (
                                    <EquipmentCard key={item.id} equipment={item} />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : null}
                {hasNoEquipment ? (
                    <EmptyState
                        title="No equipment found"
                        description="Try searching for something else or clear the filters"
                    />
                ) : null}
            </div>
        </div>
    )
}
