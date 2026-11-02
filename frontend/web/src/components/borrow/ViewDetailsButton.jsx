export default ({ onClick }) => (
	<button type="button" onClick={onClick} className="group flex cursor-pointer items-center gap-[2px] rounded-[8px] border-[0.5px] border-[#CFD7E0] bg-surface px-[12px] py-[8px] text-black transition-colors hover:bg-[#E5EBF2] hover:text-[#F59E0B]">
		<p className="text-[16px] font-medium">View Details</p>
		<svg className="h-[24px] w-[24px] shrink-0" viewBox="0 0 24 24" fill="none">
			<path d="M12.6 12L8 7.4L9.4 6L15.4 12L9.4 18L8 16.6L12.6 12Z" fill="currentColor" />
		</svg>
	</button>
)