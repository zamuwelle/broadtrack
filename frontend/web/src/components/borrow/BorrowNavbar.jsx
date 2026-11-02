import Logo from '@/components/Logo'
import ProfileToggle from '@/components/borrow/ProfileToggle'
import useUser from '@/hooks/useUser'
import summaryIcon from '@/assets/icons/borrower/summary.svg'
import bellIcon from '@/assets/icons/borrower/bell.svg'

export default () => {
	const { data: user } = useUser()

	return (
		<nav className="w-full h-20 shrink-0 bg-white shadow-sm relative z-40">
			<div className="max-w-7xl mx-auto px-8 w-full h-full flex items-center justify-between">
				<Logo link={false} />
				<div className="flex items-center gap-6">
					<div className="relative">
						<img src={summaryIcon} alt="Summary" />
						<span className="select-none absolute -top-1 -right-1 w-4 h-4 bg-[#992C2C] rounded-full text-[12px] text-surface flex items-center justify-center">3</span>
					</div>
					<div className="relative">
						<img src={bellIcon} alt="Notifications" />
						<span className="select-none absolute -top-1 -right-1 w-4 h-4 bg-[#992C2C] rounded-full text-[12px] text-surface flex items-center justify-center">3</span>
					</div>
					<ProfileToggle user={user} />
				</div>
			</div>
		</nav>
	)
}