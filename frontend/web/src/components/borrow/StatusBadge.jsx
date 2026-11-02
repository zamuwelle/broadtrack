const badges = {
	available: 'border-[#22C55E] bg-[#E8F5E9] text-[#22C55E] font-semibold',
	maintenance: 'border-[0.5px] border-[#F59E0B] bg-[#FFF7ED] text-[#F59E0B] font-bold',
	borrowed: 'border-[0.5px] border-[#0F4C81] bg-[#BBD7EE] text-[#0F4C81] font-semibold',
}

export default ({ status, className = '' }) => (
	<span className={`inline-flex h-[24px] items-center justify-center rounded-[12px] border px-[6px] py-[4px] text-[12px] ${className} ${badges[status]}`}>
		{status.toUpperCase()}
	</span>
)