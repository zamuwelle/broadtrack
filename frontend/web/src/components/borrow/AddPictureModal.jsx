import { useRef } from 'react'
import useEscapeKey from '@/hooks/useEscapeKey'
import pictureIcon from '@/assets/icons/borrower/picture.svg'
import XButton from '@/components/borrow/XButton'

export default ({ isOpen, onClose }) => {
	const fileInputRef = useRef(null)
	useEscapeKey(onClose)

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center dim-screen p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
			<div className="bg-surface p-8 rounded-[8px] w-[381px] h-[180px] relative flex flex-col">
				<XButton onClick={onClose} className="absolute top-5 right-5" />
				<h3 className="text-[18px] font-normal text-text text-center">Add profile picture</h3>
				<button type="button" onClick={() => fileInputRef.current?.click()} className="mt-[42px] w-full h-[44px] bg-gray-100 rounded-[8px] flex items-center justify-center gap-2 transition-colors hover:bg-[#E5EBF2]">
					<img src={pictureIcon} alt="" />
					<span className="text-[16px] font-normal text-[#8E8E93]">Upload from Device</span>
				</button>
				<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => { fileInputRef.current.value = '' }} />
			</div>
		</div>
	)
}
