import { getFirstName } from '@shared/util/name'
import chevronIcon from '@/assets/icons/borrower/chevron.svg'
import ProfileMenu from '@/components/borrow/ProfileMenu'
import WelcomeToast from '@/components/toast/WelcomeToast'
import useToggle from '@/hooks/useToggle'
import useToast from '@/hooks/useToast'

export default ({ user }) => {
	const { open, setOpen, boxRef } = useToggle()
	const toast = useToast()

	return (
		<div className="relative" ref={boxRef}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={`h-9 p-1.5 rounded-[8px] flex items-center gap-2 transition-colors ${open ? 'bg-sky-200' : 'bg-[#F8FAFC]'}`}
			>
				<div className="w-6 h-6 rounded-full bg-[#EDF0F4] shrink-0" />
				<span className="text-[16px] font-medium text-text">{getFirstName(user)}</span>
				<img src={chevronIcon} alt="" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
			</button>
			{open && (
				<div className="absolute right-0 top-full mt-2">
					<ProfileMenu user={user} onUpdated={() => toast.show('Profile successfully updated!')} />
				</div>
			)}
			<WelcomeToast show={toast.visible} message={toast.message} color="#22C55E" />
		</div>
	)
}
