import { useState } from 'react'

import useEscapeKey from '@/hooks/useEscapeKey'
import ProfilePicture from '@/components/borrow/ProfilePicture'
import EditProfileForm from '@/components/borrow/EditProfileForm'
import AddPictureModal from '@/components/borrow/AddPictureModal'
import XButton from '@/components/borrow/XButton'

export default ({ isOpen, onClose, onUpdated }) => {
	const [pictureOpen, setPictureOpen] = useState(false)
	useEscapeKey(() => { if (!pictureOpen) onClose() })

	if (!isOpen) return null

	return (
		<>
		<div className="fixed inset-0 z-50 flex items-center justify-center dim-screen p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
			<div className="bg-surface p-8 rounded-[8px] w-[495px] h-[751px] relative flex flex-col">
				<XButton onClick={onClose} className="absolute top-5 right-5" />
				<h3 className="text-[18px] font-normal text-text text-center">Edit Profile</h3>
				<div className="mt-[26px] flex justify-center">
					<ProfilePicture onCameraClick={() => setPictureOpen(true)} />
				</div>
				<div className="mt-8 flex-1 flex">
					<EditProfileForm onClose={onClose} onUpdated={onUpdated} />
				</div>
			</div>
		</div>
		<AddPictureModal isOpen={pictureOpen} onClose={() => setPictureOpen(false)} />
		</>
	)
}