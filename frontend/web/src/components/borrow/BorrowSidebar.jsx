import equipmentIcon from '@/assets/icons/borrower/equipment.svg'
import calendarIcon from '@/assets/icons/borrower/calendar.svg'
import slipIcon from '@/assets/icons/borrower/slip.svg'

const links = [
	{ label: 'Equipment', icon: equipmentIcon },
	{ label: 'Calendar', icon: calendarIcon },
	{ label: 'My Slips', icon: slipIcon },
]

export default ({ active, onSelect }) => (
	<aside className="w-[220px] h-full bg-white pt-[59px] px-[26px] flex flex-col gap-2">
		{links.map(({ label, icon }) => {
			const isActive = active === label
			return (
				<button
					key={label}
					type="button"
					onClick={() => onSelect(label)}
					className={`w-full h-[64px] rounded-[8px] flex items-center gap-[10px] px-4 text-[16px] font-normal transition-colors ${isActive ? 'bg-primary text-white' : 'bg-[#F8FAFC] text-text hover:bg-[#E5EBF2]'}`}
				>
					<img src={icon} alt="" className={`transition-colors ${isActive ? 'brightness-0 invert' : ''}`} />
					{label}
				</button>
			)
		})}
	</aside>
)