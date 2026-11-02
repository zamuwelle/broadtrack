import useEscapeKey from '@/hooks/useEscapeKey'
import Button from '@/components/borrow/Button'
import XButton from '@/components/borrow/XButton'

export default ({ isOpen, onClose, onConfirm }) => {
	useEscapeKey(onClose)

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center dim-screen p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
			<div className="bg-surface p-8 rounded-[8px] w-[350px] h-[189px] relative flex flex-col">
				<XButton onClick={onClose} className="absolute top-5 right-5" />
				<h3 className="text-[18px] font-normal text-text text-center">Logout</h3>
				<p className="text-[14px] text-[#8E8E93] text-center mt-2">You will be returned to the landing page.</p>
				<div className="mt-auto flex items-center justify-center gap-8">
					<Button onClick={onClose}>Cancel</Button>
					<Button variant="danger" onClick={onConfirm}>Logout</Button>
				</div>
			</div>
		</div>
	)
}