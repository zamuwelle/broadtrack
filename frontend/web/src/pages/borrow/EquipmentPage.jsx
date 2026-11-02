import { useState } from 'react'
import Banner from '@/components/borrow/Banner'
import SearchInput from '@/components/borrow/SearchInput'
import CategoryButtons from '@/components/borrow/CategoryButtons'
import EquipmentCard from '@/components/borrow/EquipmentCard'
import useEquipment from '@/hooks/useEquipment'
import useEvents from '@/hooks/useEvents'
import { matchesSearch } from '@shared/util/search'
import { equipmentCategories } from '@shared/data/equipmentCategories'

export default () => {
	const [category, setCategory] = useState('All')
	const [searchText, setSearchText] = useState('')
	const { data: equipment } = useEquipment()
	useEvents()

	const categoryNames = ['All', ...equipmentCategories]
	const filtered = (equipment ?? []).filter(item =>
		(category === 'All' || item.category?.name === category) && matchesSearch(item, searchText)
	)

	return (
		<div className="flex flex-col gap-[42px]">
			<Banner title="Request BAB Equipment">
				Browse our verified BAB Equipment asset catalog, check date availability,<br />
				and book gear instantly. Your booking slip will generate immediately.
			</Banner>
			<div className="flex flex-col gap-[16px]">
				<SearchInput value={searchText} onChange={setSearchText} />
				<CategoryButtons categories={categoryNames} selected={category} onSelect={setCategory} />
			</div>
			<div className="flex flex-col gap-[32px]">
				<p className="text-[14px]">Available Equipment</p>
				{filtered.length ? (
					<div className="grid grid-cols-[repeat(auto-fit,minmax(min(501px,100%),1fr))] gap-[24px]">
						{filtered.map((item) => <EquipmentCard key={item.id} equipment={item} />)}
					</div>
				) : (
					<p className="text-[14px] text-[#8E8E93]">No equipment found.</p>
				)}
			</div>
		</div>
	)
}