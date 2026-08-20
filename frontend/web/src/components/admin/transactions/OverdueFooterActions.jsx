import { Mail } from 'lucide-react'

const noop = () => null

export const OverdueFooterActions = ({ onOpenSendReminder = noop, onOpenConfirmReturn = noop }) => (
    <div className="px-4 py-5 sm:px-8 sm:py-6 bg-slate-50 flex flex-col items-center gap-4 shrink-0">
        <button
            type="button"
            onClick={onOpenSendReminder}
            className="w-full sm:w-auto h-12 px-6 bg-sky-800 hover:bg-sky-900 transition-colors rounded-lg text-white text-base font-medium inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <Mail size={18} />
            <span>Send Reminder Again</span>
        </button>

        <div className="text-xs sm:text-sm font-medium text-slate-700 flex flex-wrap justify-center items-center gap-1.5">
            <span>Has the equipment been returned?</span>
            <button
                type="button"
                onClick={onOpenConfirmReturn}
                className="text-blue-600 hover:underline font-semibold cursor-pointer">
                Confirm here
            </button>
        </div>
    </div>
)
