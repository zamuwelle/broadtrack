import { useState } from 'react'
import useSend from '@/hooks/useSend'
import { contactService } from '@/api'

const fieldClass = 'w-[368px] h-[64px] rounded-[8px] bg-[#D9D9D9] px-4 text-text placeholder:text-[18px] text-[18px] outline-none'
const textareaClass = 'w-[368px] h-[112px] rounded-[8px] bg-[#D9D9D9] p-4 text-text placeholder:text-[18px] text-[18px] outline-none resize-none'
const sendClass = 'w-[368px] h-[48px] flex items-center justify-center rounded-[8px] border border-[#D9D9D9] text-[#D9D9D9] text-[16px] font-medium hover:bg-white/10 transition-colors'

export default () => {
	const [isOpen, setIsOpen] = useState(false)
	const [sent, setSent] = useState(false)
	const { send, isPending, error, reset } = useSend({
		send: contactService.send,
		onSuccess: () => setSent(true),
	})

	const handleSubmit = (e) => {
		e.preventDefault()
		const data = new FormData(e.target)
		send({
			firstname: data.get('firstname'),
			lastname: data.get('lastname'),
			email: data.get('email'),
			message: data.get('message'),
		})
	}

	const close = () => {
		setIsOpen(false)
		setTimeout(() => { setSent(false); reset() }, 300)
	}

	return (
		<>
			{isOpen && (
				<div
					onClick={close}
					className="fixed inset-0 z-50 dim-screen transition-opacity"
				/>
			)}
			<div className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-300 drop-shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-[448px]'}`}>
				<button
					onClick={() => isOpen ? close() : setIsOpen(true)}
					className="w-[32px] h-[160px] flex items-center justify-center bg-primary text-surface text-[14px] font-bold rounded-l-[8px] outline-none shrink-0"
				>
					<span className="-rotate-90 whitespace-nowrap">
						{isOpen ? 'CLOSE' : 'QUICK CONTACT'}
					</span>
				</button>
				<div className="w-[448px] h-[640px] bg-primary rounded-l-[8px] flex flex-col items-center justify-center shrink-0">
					{sent ? (
						<div className="w-[368px] flex flex-col items-center justify-center text-center text-surface py-8">
							<h4 className="text-[22px] font-bold">Message Sent!</h4>
							<p className="text-[14px] text-surface/80 mt-2 mb-6">Thank you for your feedback.</p>
							<button
								type="button"
								onClick={() => { setSent(false); reset() }}
								className="px-4 py-2 rounded-[8px] border border-white/30 text-surface text-[14px] hover:bg-white/10 transition-colors"
							>
								Send another message
							</button>
						</div>
					) : (
						<>
							<h3 className="text-surface text-[22px] font-bold text-center leading-snug">
								We welcome your questions and<br />feedback!
							</h3>
							<div className="h-6" />
							<form onSubmit={handleSubmit} className="flex flex-col gap-4">
								<input name="firstname" type="text" required placeholder="* First Name" className={fieldClass} />
								<input name="lastname" type="text" required placeholder="* Last Name" className={fieldClass} />
								<input name="email" type="email" required placeholder="* Email" className={fieldClass} />
								<textarea name="message" required placeholder="* How can we help you?" className={textareaClass} />
								<div className="h-2" />
								{error && <p className="text-[14px] text-red-300 text-center">Something went wrong, try again.</p>}
								<button type="submit" disabled={isPending} className={`${sendClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
									{isPending ? 'Sending...' : 'Send'}
								</button>
							</form>
						</>
					)}
				</div>
			</div>
		</>
	)
}
