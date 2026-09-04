import { X } from 'lucide-react'

const defaultBadge = Object.freeze({ className: '', label: '' })
const noop = () => null

export const ModalHeader = ({
    equipmentTitle = '',
    equipmentBadge = defaultBadge,
    equipmentModel = '',
    equipmentSerial = '',
    onClose = noop
}) => (
    <div className="px-4 pt-5 pb-3.5 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8 lg:pt-7 lg:pb-5 flex items-start justify-between bg-slate-50 shrink-0">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{equipmentTitle}</h2>
                <span
                    className={`px-2.5 py-0.5 border rounded-2xl text-[10px] font-semibold ${equipmentBadge.className}`}>
                    {equipmentBadge.label}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500">
                {equipmentModel ? (
                    <>
                        <span>Model: {equipmentModel}</span>
                        <span>|</span>
                    </>
                ) : null}
                <span>Serial Number: {equipmentSerial}</span>
            </div>
        </div>

        <button
            type="button"
            onClick={onClose}
            className="size-9 sm:size-10 rounded-[10px] border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
            <X size={18} />
        </button>
    </div>
)
