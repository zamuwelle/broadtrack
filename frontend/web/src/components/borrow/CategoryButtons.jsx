export default ({ categories = ['All'], selected, onSelect }) => (
	<div className="flex flex-wrap gap-[12px]">
		{categories.map(category => (
			<button
				key={category}
				type="button"
				onClick={() => onSelect(category)}
				className={`h-[38px] px-4 rounded-[8px] text-[16px] flex items-center justify-center border transition-colors ${selected === category ? 'bg-primary text-surface border-transparent' : 'bg-[#F8FAFC] text-text border-[#CFD7E0] hover:bg-[#E5EBF2] hover:border-[#E5EBF2]'}`}
			>
				{category}
			</button>
		))}
	</div>
)