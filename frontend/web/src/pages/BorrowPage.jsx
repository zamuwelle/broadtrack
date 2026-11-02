import { useState } from 'react'
import BorrowNavbar from '@/components/borrow/BorrowNavbar'
import BorrowSidebar from '@/components/borrow/BorrowSidebar'
import EquipmentPage from '@/pages/borrow/EquipmentPage'
import CalendarPage from '@/pages/borrow/CalendarPage'
import SlipsPage from '@/pages/borrow/SlipsPage'

const pages = {
	Equipment: EquipmentPage,
	Calendar: CalendarPage,
	'My Slips': SlipsPage,
}

export default () => {
	const [active, setActive] = useState('Equipment')
	const Page = pages[active]

	return (
		<div className="h-screen flex flex-col">
			<BorrowNavbar />
			<div className="flex flex-1 min-h-0">
				<BorrowSidebar active={active} onSelect={setActive} />
				<main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
					<div className="px-[86px] py-[79px]">
						<Page />
					</div>
				</main>
			</div>
		</div>
	)
}