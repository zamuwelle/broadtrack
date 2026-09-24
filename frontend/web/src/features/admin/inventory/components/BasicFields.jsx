import { cn } from 'cn'
import { ErrorText } from '@/components/ui/form/ErrorText'

const noop = () => null

export const BasicFields = ({
    equipmentName = '',
    nameError = '',
    modelCode = '',
    serialNumber = '',
    onNameChange = noop,
    onModelChange = noop,
    onSerialChange = noop
}) => (
    <>
        <div className="flex flex-col gap-1">
            <label htmlFor="equipment-name-input" className="text-xs font-semibold text-slate-800">
                Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
                id="equipment-name-input"
                type="text"
                value={equipmentName}
                onChange={onNameChange}
                placeholder="e.g. Sony Alpha A7 IV"
                className={cn(
                    'h-10 px-3.5 rounded-lg border bg-white text-xs text-slate-900 outline-none focus:border-amber-500',
                    {
                        'border-red-500': Boolean(nameError),
                        'border-slate-300': !nameError
                    }
                )}
            />
            <ErrorText message={nameError} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
                <label htmlFor="model-code-input" className="text-xs font-semibold text-slate-800">
                    Model / Code
                </label>
                <input
                    id="model-code-input"
                    type="text"
                    value={modelCode}
                    onChange={onModelChange}
                    placeholder="e.g. ILCE-7M4"
                    className="h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-amber-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="serial-number-input" className="text-xs font-semibold text-slate-800">
                    Serial Number
                </label>
                <input
                    id="serial-number-input"
                    type="text"
                    value={serialNumber}
                    onChange={onSerialChange}
                    placeholder="e.g. SN-8821903"
                    className="h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-amber-500"
                />
            </div>
        </div>
    </>
)
