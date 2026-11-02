import { Barcode } from '@/features/borrow/slips/components/Barcode'

export const SlipFooter = ({ isPending, ticketId, onCancel, onPrint }) => (
    <div className="self-stretch flex flex-col justify-start items-center gap-3 shrink-0 mt-auto pt-4">
        <div className="self-stretch h-0 border-b border-dotted border-slate-300 mb-1" />
        <Barcode ticketId={ticketId} />

        {isPending ? (
            <div className="self-stretch inline-flex justify-center items-center gap-3.5 mt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-center items-center hover:bg-slate-100 cursor-pointer text-slate-800 text-sm font-medium">
                    Cancel Request
                </button>
                <button
                    type="button"
                    onClick={onPrint}
                    className="flex-1 h-9 px-3 bg-sky-800 rounded-lg flex justify-center items-center gap-2 hover:bg-sky-900 cursor-pointer text-white text-sm font-medium">
                    PDF Slip
                </button>
            </div>
        ) : (
            <button
                type="button"
                onClick={onPrint}
                className="self-stretch h-9 p-2.5 bg-sky-800 rounded-lg inline-flex justify-center items-center gap-2.5 hover:bg-sky-900 cursor-pointer text-white text-base font-medium mt-1">
                PDF Slip
            </button>
        )}
    </div>
)
