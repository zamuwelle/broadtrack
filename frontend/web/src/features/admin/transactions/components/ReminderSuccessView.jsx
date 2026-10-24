import { CircleCheck, X } from 'lucide-react'

const noop = () => null

export const ReminderSuccessView = ({ sentTimestamp = '', onClose = noop }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
        <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
        />
        <div className="bg-slate-50 rounded-[18px] border border-slate-300 w-full max-w-[453px] max-h-[90dvh] overflow-y-auto my-auto shadow-2xl relative z-10">
            <button
                type="button"
                aria-label="Close reminder"
                onClick={onClose}
                className="absolute right-5 top-3 size-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
            </button>
            <div className="flex items-center justify-center gap-2 px-6 pt-10 pb-5 text-success text-lg font-semibold [@media(max-height:500px)]:pt-6 [@media(max-height:500px)]:pb-3">
                <CircleCheck size={20} />
                <span>Reminder Sent</span>
            </div>
            <div className="bg-white px-6 sm:px-12 py-6 [@media(max-height:500px)]:py-3 flex flex-col gap-3 text-sm sm:text-base font-medium text-slate-800">
                <p>The overdue reminder has been sent to the borrower&apos;s registered email address.</p>
                <p>Sent: {sentTimestamp}</p>
            </div>
            <div className="h-10" />
        </div>
    </div>
)
