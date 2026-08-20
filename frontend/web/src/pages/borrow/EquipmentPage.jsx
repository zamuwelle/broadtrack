import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banner } from '@/components/ui/Banner'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryButtons } from '@/components/borrow/equipment/CategoryButtons'
import { EquipmentCard } from '@/components/borrow/equipment/EquipmentCard'
import { useEquipment } from '@/hooks/queries/useEquipment'
import { useSetState } from '@shared/hooks/useSetState'
import { matchesSearch } from '@shared/util/search'
import { equipmentCategories } from '@shared/data/equipmentCategories'

const categoryOptions = Object.freeze(['All', ...equipmentCategories])
const defaultEquipmentList = Object.freeze([])

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

const gridClassMap = Object.freeze({
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
})

export const EquipmentPage = () => {
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
    const { data: equipment = defaultEquipmentList, isLoading } = useEquipment()

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
                const categoryName = item.category ? item.category.name : ''
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

    return (
        <div className="flex flex-col font-['Poppins']">
            <Banner title="Request BAB Equipment">
                Browse our verified BAB Equipment asset catalog, check date availability,
                <br />
                and book gear instantly. Your booking slip will generate immediately.
            </Banner>
            <div className="mt-[42px] flex flex-col gap-[16px]">
                <SearchInput value={searchText} onChange={handleSearchChange} />
                <CategoryButtons categories={categoryOptions} selected={category} onSelect={handleCategorySelect} />
            </div>
            <div className="mt-8">
                {!isLoading && filteredEquipment.length > 0 && (
                    <div className={`grid ${gridClassMap[columnCount]} gap-6 items-start`}>
                        {columns.map((column) => (
                            <div key={column.id} className="flex flex-col gap-6">
                                {column.items.map((item) => (
                                    <EquipmentCard key={item.id} equipment={item} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && filteredEquipment.length === 0 && (
                    <EmptyState
                        title="No equipment found"
                        description="Try searching for something else or clear the filters"
                    />
                )}
            </div>
        </div>
    )
}
