import useToggle from '@/hooks/useToggle'
import chevronIcon from '@/assets/icons/borrower/chevron2.svg'

export default ({ value, onChange, options, placeholder = '', icon, error, className = '', wrapperClass = '', panelClass = '', hoverClass = 'hover:bg-gray-100', selectedClass = '' }) => {
	const { open, setOpen, boxRef } = useToggle()

	return (
		<div ref={boxRef} className={`relative flex ${wrapperClass}`}>
			<button
				type="button"
				onClick={() => setOpen(open => !open)}
				style={open ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : undefined}
				className={`flex items-center text-left cursor-pointer rounded-[8px] ${error && 'border-red-500'} ${className}`}
				title={value || placeholder}
			>
				{icon && (
					<>
						<img src={icon} alt="" />
						<span className="w-px h-6 bg-[#CFD7E0]" />
					</>
				)}
				<span className={`flex-1 truncate ${value ? '' : 'text-[#8E8E93]'}`}>{value || placeholder}</span>
				<img src={chevronIcon} alt="" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
			</button>
			{open && (
				<div className={`absolute bottom-full left-0 right-0 z-30 mb-[1px] rounded-t-[8px] border border-[#CFD7E0] ${panelClass}`}>
					{options.map(option => (
						<button
							key={option}
							type="button"
							onClick={() => { onChange(option); setOpen(false) }}
							className={`w-full h-10 px-4 flex items-center text-left text-[14px] whitespace-nowrap text-text cursor-pointer ${value === option ? selectedClass : ''} ${hoverClass}`}
						>
							{option}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
