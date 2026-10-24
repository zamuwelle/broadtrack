import { X } from 'lucide-react'

const noop = () => null

const formatEmail = (email) => {
    const at = email.indexOf('@')
    if (at === -1) {
        return email
    }
    return (
        <>
            {email.slice(0, at)}
            <wbr />
            {email.slice(at)}
        </>
    )
}

export const ReminderPromptView = ({
    recipientEmail = '',
    errorMessage = '',
    isSubmitting = false,
    onClose = noop,
    onSend = noop
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
        <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
        />
        <div className="bg-slate-50 rounded-[18px] border border-slate-300 w-full max-w-[453px] max-h-[90dvh] overflow-y-auto my-auto shadow-2xl relative z-10">
            <div className="relative px-12 max-[374px]:px-3 pt-10 max-[374px]:pt-12 pb-5 text-center [@media(max-height:500px)]:pt-6 [@media(max-height:500px)]:pb-3">
                <button
                    type="button"
                    aria-label="Close reminder"
                    onClick={onClose}
                    className="absolute right-5 top-3 size-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X size={16} />
                </button>
                <h2 className="text-lg font-semibold text-slate-800">Send Overdue Reminder?</h2>
            </div>
            <div className="bg-white px-6 sm:px-12 py-6 [@media(max-height:500px)]:py-3 text-sm sm:text-base font-medium text-slate-800">
                <p>
                    You&apos;re about to send an overdue reminder to{' '}
                    <span className="text-blue-600 [overflow-wrap:anywhere]">{formatEmail(recipientEmail)}</span>.
                </p>
                {errorMessage ? <p className="mt-3 text-xs text-rose-700">{errorMessage}</p> : null}
            </div>
            <div className="px-6 py-4 flex justify-center">
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onSend}
                    className="min-w-[168px] h-11 px-5 bg-primary hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium cursor-pointer">
                    {isSubmitting ? 'Sending...' : 'Send Reminder'}
                </button>
            </div>
        </div>
    </div>
)
