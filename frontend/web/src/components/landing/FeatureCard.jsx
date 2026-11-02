import eyeIcon from '@/assets/icons/landing/feature-cards/eye.svg'
import inventoryIcon from '@/assets/icons/landing/feature-cards/inventory.svg'
import taskIcon from '@/assets/icons/landing/feature-cards/task.svg'

const icons = {
	eye: eyeIcon,
	inventory: inventoryIcon,
	task: taskIcon
}

export default ({ icon, title, description }) => (
	<div className="w-[392px] h-[248px] flex flex-col items-center justify-center gap-2 p-[32px] rounded-[8px] bg-[#F5F5F5] border border-[#D9D9D9]">
		<img src={icons[icon]} alt={title} className="w-6 h-6" />
		<h3 className="text-text text-[24px] font-semibold text-center">{title}</h3>
		<p className="text-text text-[18px] text-center">{description}</p>
	</div>
)