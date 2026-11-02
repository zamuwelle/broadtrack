export default ({ show, message, color = '#F59E0B' }) => (
	<div className={`fixed top-[96px] left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ease-in-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
		<div className="flex items-center justify-center gap-2.5 h-[50px] px-4 rounded-[8px] whitespace-nowrap" style={{ backgroundColor: color }}>
			<svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<path d="m9 12 2 2 4-4" />
			</svg>
			<p className="text-[12px] font-medium text-white whitespace-nowrap truncate">{message}</p>
		</div>
	</div>
)