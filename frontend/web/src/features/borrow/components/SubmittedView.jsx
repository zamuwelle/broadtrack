import { Icon } from '@/components/ui/Icon'
import { XButton } from '@/components/ui/XButton'

const noop = () => null

export const SubmittedView = ({ onClose = noop, onViewSlips = noop }) => (
    <div className="relative flex w-full max-w-[560px] flex-col items-center justify-start gap-4 sm:gap-5 rounded-lg bg-white p-4 sm:p-6 lg:p-7 shadow-xl font-['Poppins'] max-h-[88dvh] overflow-y-scroll my-auto">
        <div className="relative flex w-full items-center justify-center">
            <XButton onClick={onClose} className="absolute right-0 top-0 size-7 flex items-center justify-center" />
            <div className="flex size-7 items-center justify-center rounded-full bg-green-500">
                <Icon name="check" className="size-4 text-white" />
            </div>
        </div>
        <h3 className="text-center text-xl font-medium text-text mt-1">Request submitted successfully!</h3>
        <div className="flex w-full flex-col items-center justify-start gap-3 text-center">
            <p className="text-xs font-normal text-text">
                Your borrow request has been submitted and is now pending approval.
            </p>
            <p className="text-xs font-normal text-neutral-400">
                You can check the status and details of your request in My Slips.
            </p>
        </div>
        <div className="mt-4 flex w-full items-center justify-end">
            <button
                type="button"
                onClick={onViewSlips}
                className="inline-flex h-9 items-center justify-center gap-2.5 rounded-lg bg-amber-500 px-3.5 py-2 text-base font-medium text-white hover:bg-amber-600 transition-colors cursor-pointer">
                <Icon name="slip" className="size-5 brightness-0 invert" />
                <span>View My Slips</span>
            </button>
        </div>
    </div>
)
