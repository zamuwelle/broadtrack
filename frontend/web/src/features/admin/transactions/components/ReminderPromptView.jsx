const noop = () => null

export const ReminderPromptView = ({
    borrowerName = '',
    borrowerDepartment = '',
    equipmentName = '',
    dueDate = '',
    recipientEmail = '',
    errorMessage = '',
    isSubmitting = false,
    onClose = noop,
    onSend = noop
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
        <button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
            onClick={onClose}
        />
        <div className="bg-slate-50 rounded-2xl border border-slate-300 w-full max-w-[480px] max-h-[90dvh] overflow-y-scroll my-auto shadow-2xl flex flex-col py-5 sm:py-7 relative z-10">
            <div className="flex flex-col items-center text-center px-4 sm:px-8 pb-4 sm:pb-5">
                <h2 className="text-xl sm:text-2xl font-semibold text-black">Send Overdue Reminder?</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                    You&apos;re about to send an overdue reminder to the borrower.
                </p>
            </div>

            {errorMessage ? (
                <div className="mx-4 sm:mx-8 mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center">
                    {errorMessage}
                </div>
            ) : null}

            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 border-y border-slate-200 flex justify-center">
                <div className="w-full bg-slate-50 rounded-2xl border border-slate-300 p-4 sm:p-5 flex flex-col gap-3 text-xs sm:text-sm">
                    <div>
                        <span className="font-semibold text-black">Borrower: </span>
                        <span className="text-slate-800">
                            {borrowerName}, {borrowerDepartment}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-black">Equipment: </span>
                        <span className="text-slate-800">{equipmentName}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-black">Due Date: </span>
                        <span className="text-slate-800">{dueDate}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-black">Recipient: </span>
                        <span className="text-slate-800 break-all">{recipientEmail}</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 px-5 sm:px-8 flex flex-row justify-center items-center gap-3 sm:gap-6 w-full">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:w-40 sm:flex-initial h-11 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold cursor-pointer">
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onSend}
                    className="flex-1 sm:w-44 sm:flex-initial h-11 bg-sky-800 hover:bg-sky-900 disabled:opacity-50 transition-colors rounded-xl text-white text-sm font-semibold cursor-pointer shadow-sm">
                    {isSubmitting ? 'Sending...' : 'Send Reminder'}
                </button>
            </div>
        </div>
    </div>
)
