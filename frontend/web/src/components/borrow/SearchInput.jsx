import searchIcon from '@/assets/icons/borrower/search.svg'

export default ({ value, onChange, className = '' }) => (
	<div className={`w-full h-[46px] bg-[#F8FAFC] border border-[#8E8E93] rounded-[8px] flex items-center gap-[18px] px-[22px] py-[10px] ${className}`}>
		<img src={searchIcon} alt="" />
		<input type="text" value={value} onChange={({ target }) => onChange(target.value)} placeholder="Search camera, lenses, mics, lights..." className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-text placeholder:text-[#8E8E93]" />
	</div>
)