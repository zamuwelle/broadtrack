import { cn } from 'cn'
import { ErrorText } from '@/components/ui/form/ErrorText'

const noop = () => null

export const BasicFields = ({
    equipmentName = '',
    nameError = '',
    modelCode = '',
    modelError = '',
    serialNumber = '',
    serialError = '',
    onNameChange = noop,
    onModelChange = noop,
    onSerialChange = noop
}) => (
    <>
        <div>
            <label htmlFor="equipment-name-input" className="block mb-1 text-xs font-semibold text-slate-800">
                Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
                id="equipment-name-input"
                type="text"
                value={equipmentName}
                onChange={onNameChange}
                placeholder="e.g. Sony Alpha A7 IV"
                className={cn(
                    'w-full h-10 px-3.5 rounded-lg border bg-white text-xs text-slate-900 outline-none focus:border-amber-500',
                    {
                        'border-red-500': Boolean(nameError),
                        'border-slate-300': !nameError
                    }
                )}
            />
            <ErrorText message={nameError} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
            <div>
                <label htmlFor="model-code-input" className="block mb-1 text-xs font-semibold text-slate-800">
                    Model / Code
                </label>
                <input
                    id="model-code-input"
                    type="text"
                    value={modelCode}
                    onChange={onModelChange}
                    placeholder="e.g. ILCE-7M4"
                    className={cn(
                        'w-full h-10 px-3.5 rounded-lg border bg-white text-xs text-slate-900 outline-none focus:border-amber-500',
                        modelError ? 'border-red-500' : 'border-slate-300'
                    )}
                />
                <ErrorText message={modelError} />
            </div>

            <div>
                <label htmlFor="serial-number-input" className="block mb-1 text-xs font-semibold text-slate-800">
                    Serial Number
                </label>
                <input
                    id="serial-number-input"
                    type="text"
                    value={serialNumber}
                    onChange={onSerialChange}
                    placeholder="e.g. SN-8821903"
                    className={cn(
                        'w-full h-10 px-3.5 rounded-lg border bg-white text-xs text-slate-900 outline-none focus:border-amber-500',
                        serialError ? 'border-red-500' : 'border-slate-300'
                    )}
                />
                <ErrorText message={serialError} />
            </div>
        </div>
    </>
)
