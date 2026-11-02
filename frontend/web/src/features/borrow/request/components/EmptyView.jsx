import { Icon } from '@/components/ui/Icon'
import { XButton } from '@/components/ui/XButton'

const noop = () => null

export const EmptyView = ({ onClose = noop, onBrowse = noop }) => (
    <div className="relative flex w-full max-w-[560px] flex-col items-start justify-start gap-4 sm:gap-6 rounded-lg bg-white p-4 sm:p-6 lg:p-7 shadow-xl font-['Poppins'] max-h-[88dvh] overflow-y-scroll my-auto">
        <div className="relative flex w-full items-center justify-between">
            <h3 className="w-full text-center text-lg font-medium text-text px-6">Borrow Request Summary</h3>
            <XButton onClick={onClose} className="absolute right-0 top-0 size-7 flex items-center justify-center" />
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg bg-zinc-100/40 p-8 outline outline-1 outline-offset-[-1px] outline-slate-300">
            <div className="inline-flex items-center justify-center gap-3">
                <Icon name="summary" className="h-6 w-7 opacity-40" />
                <span className="text-xs font-normal text-text">Your basket is empty</span>
            </div>
            <p className="text-center text-xs font-normal text-neutral-400">
                You haven&apos;t selected any equipment yet.
            </p>
        </div>
        <div className="flex w-full items-center justify-end">
            <button
                type="button"
                onClick={onBrowse}
                className="inline-flex h-9 items-center justify-center gap-2.5 rounded-lg bg-sky-800 px-3 py-2 text-base font-medium text-white hover:bg-sky-900 cursor-pointer">
                <Icon name="search" className="size-5 brightness-0 invert" />
                <span>Browse Equipment</span>
            </button>
        </div>
    </div>
)
