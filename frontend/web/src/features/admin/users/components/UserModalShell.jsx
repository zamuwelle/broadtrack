import { X } from 'lucide-react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'

export const UserModalShell = ({ title, subtitle, onClose, children, onSubmit, submitLabel, isPending, disabled }) => {
    useEscapeKey(onClose)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-[420px] max-h-[90dvh] overflow-y-scroll my-auto p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 shadow-xl font-['Poppins']">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-medium text-text">{title}</h2>
                        <p className="text-sm text-text/70">{subtitle}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        onClick={onClose}
                        className="size-10 flex items-center justify-center rounded-[10px] border border-slate-300 hover:bg-slate-50 text-text/60 hover:text-text cursor-pointer">
                        <X size={14} />
                    </button>
                </div>
                <form noValidate autoComplete="off" className="flex flex-col gap-2.5" onSubmit={onSubmit}>
                    {children}
                    <div className="flex flex-row justify-end items-center gap-3 sm:gap-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-initial h-9 px-4 bg-slate-50 rounded-lg text-base font-medium hover:bg-slate-100 cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={disabled || isPending}
                            className="flex-1 sm:flex-initial h-9 px-4 bg-sky-800 rounded-lg text-base font-medium text-white hover:bg-sky-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {isPending ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
