import { RotateCcw } from 'lucide-react'
import { ActivityLogEntry } from '@/features/admin/transactions/components/ActivityLogEntry'

const defaultEntries = Object.freeze([])

export const ActivityLogSection = ({
    equipmentId = '',
    entries = defaultEntries,
    selectedId,
    onReminder,
    onReturn
}) => (
    <div className="bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-y border-slate-200 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-wide">
                <RotateCcw size={16} className="text-slate-500" />
                <span>ACTIVITY &amp; TRANSACTION LOG ({entries.length})</span>
            </div>
            {equipmentId ? (
                <span className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-300 text-slate-600 text-[11px] sm:text-xs font-medium whitespace-nowrap">
                    ID: {equipmentId}
                </span>
            ) : null}
        </div>
        {entries.map((entry) => (
            <ActivityLogEntry
                key={entry.booking.id}
                {...entry}
                selected={entry.booking.id === selectedId}
                onReminder={onReminder}
                onReturn={onReturn}
            />
        ))}
    </div>
)
