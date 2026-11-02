import searchIcon from '@/assets/icons/landing/procedure/search.svg'
import tasklistIcon from '@/assets/icons/landing/procedure/tasklist.svg'
import bellIcon from '@/assets/icons/landing/procedure/bell.svg'
import equipmentIcon from '@/assets/icons/landing/procedure/equipment.svg'
import undoIcon from '@/assets/icons/landing/procedure/undo.svg'
import historyIcon from '@/assets/icons/landing/procedure/history.svg'

const iconMap = {
	search: searchIcon,
	tasklist: tasklistIcon,
	bell: bellIcon,
	equipment: equipmentIcon,
	undo: undoIcon,
	history: historyIcon
}

export const topRow = [
	{
		number: 1,
		icon: iconMap.search,
		title: 'Browse Equipment',
		description: 'Check equipment availability and\nfind what you need.',
		iconSize: 'w-5 h-5'
	},
	{
		number: 2,
		icon: iconMap.tasklist,
		title: 'Submit a Request',
		description: 'Choose your equipment and submit\na borrowing request online.',
		iconSize: 'w-[18px] h-5'
	},
	{
		number: 3,
		icon: iconMap.bell,
		title: 'Track Your Request',
		description: 'Stay updated on your request status\nand due dates.',
		iconSize: 'w-5 h-5'
	}
]

export const bottomRow = [
	{
		number: 6,
		icon: iconMap.history,
		title: 'View Borrowing History',
		description: 'Review your past borrowing\ntransactions and equipment\nrecords.',
		iconSize: 'w-[15px] h-[17px]'
	},
	{
		number: 5,
		icon: iconMap.undo,
		title: 'Return Equipment',
		description: 'Return the equipment and complete\nthe digital check-in process.',
		iconSize: 'w-[15px] h-[17px]'
	},
	{
		number: 4,
		icon: iconMap.equipment,
		title: 'Check Out Equipment',
		description: 'Collect approved equipment and\nrecord your transaction digitally.',
		iconSize: 'w-[18px] h-[18px]'
	}
]