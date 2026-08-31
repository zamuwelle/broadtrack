import { Check } from 'lucide-react'

const noop = () => null

export const ReminderSuccessView = ({ sentTimestamp = '', onClose = noop }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
        <button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
            onClick={onClose}
        />
        <div className="bg-slate-50 rounded-2xl border border-slate-300 w-full max-w-[453px] max-h-[90dvh] overflow-y-scroll my-auto shadow-2xl flex flex-col py-6 sm:py-8 relative z-10">
            <div className="flex flex-col items-center justify-center gap-2 pb-4">
                <div className="flex items-center gap-2 text-green-500 text-lg font-semibold">
                    <div className="size-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Check size={16} />
                    </div>
                    <span>Reminder Sent</span>
                </div>
            </div>

            <div className="bg-white px-6 sm:px-8 py-5 sm:py-6 flex flex-col gap-2.5 border-y border-slate-200">
                <p className="text-black text-sm font-medium leading-relaxed">
                    The overdue reminder has been sent to the borrower&apos;s registered email address.
                </p>
                <p className="text-slate-600 text-xs font-normal">Sent: {sentTimestamp}</p>
            </div>

            <div className="pt-6 flex justify-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-8 bg-sky-800 hover:bg-sky-900 transition-colors rounded-xl text-white text-sm font-semibold cursor-pointer">
                    Done
                </button>
            </div>
        </div>
    </div>
)
