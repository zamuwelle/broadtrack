const calendarPath = 'M4.44444 24C3.77222 24 3.19696 23.7652 2.71867 23.2956C2.24037 22.826 2.00081 22.2608 2 21.6V4.8C2 4.14 2.23956 3.5752 2.71867 3.1056C3.19778 2.636 3.77304 2.4008 4.44444 2.4H5.66667V1.2C5.66667 0.860004 5.784 0.575204 6.01867 0.345604C6.25333 0.116004 6.54341 0.000804138 6.88889 4.13793e-06C7.23437 -0.000795862 7.52485 0.114404 7.76033 0.345604C7.99581 0.576804 8.11274 0.861604 8.11111 1.2V2.4H17.8889V1.2C17.8889 0.860004 18.0062 0.575204 18.2409 0.345604C18.4756 0.116004 18.7656 0.000804138 19.1111 4.13793e-06C19.4566 -0.000795862 19.7471 0.114404 19.9826 0.345604C20.218 0.576804 20.335 0.861604 20.3333 1.2V2.4H21.5556C22.2278 2.4 22.8034 2.6352 23.2826 3.1056C23.7617 3.576 24.0008 4.1408 24 4.8V21.6C24 22.26 23.7608 22.8252 23.2826 23.2956C22.8043 23.766 22.2286 24.0008 21.5556 24H4.44444ZM4.44444 21.6H21.5556V9.6H4.44444V21.6Z'

const notices = {
	available: {
		pill: 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]',
		text: 'FULLY AVAILABLE FOR THIS PERIOD.',
		icon: <svg className="h-[12px] w-[16px] shrink-0" viewBox="0 0 16 12" fill="none"><path d="M1 6.5L5.5 11L15 1" stroke="currentColor" strokeWidth="2" /></svg>,
	},
	maintenance: {
		pill: 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]',
		text: 'OUT OF SERVICE FOR MAINTENANCE',
		icon: null,
	},
	borrowed: {
		pill: 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]',
		text: <>ALREADY RESERVED ON CERTAIN DATES.<br />REVIEW SCHEDULING</>,
		icon: <svg className="h-[18px] w-[20.5px] shrink-0" viewBox="0 0 26 24" fill="currentColor"><path d={calendarPath} /></svg>,
	},
}

export default ({ status }) => (
	<div className="flex flex-col gap-[6px] rounded-[8px] border border-[#E5E5EA] bg-[#F4F4F4]/40 px-[22px] pt-[6px] pb-[10px]">
		<div className="flex items-center gap-[12px]">
			<svg className="h-[22px] w-[22px] text-[#8E8E93]" viewBox="0 0 26 24" fill="currentColor"><path d={calendarPath} /></svg>
			<p className="text-[14px] text-[#8E8E93]">Showing scheduled dates for this item:</p>
		</div>
		<div className={`flex items-center justify-center gap-[4px] self-stretch rounded-[8px] border px-[12px] py-[4px] ${notices[status].pill}`}>
			{notices[status].icon}
			<p className="text-center text-[12px] font-bold">{notices[status].text}</p>
		</div>
	</div>
)