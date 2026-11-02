import { Calendar } from 'lucide-react'

export const DateBlock = ({ label = '', dateText = '' }) => (
    <div className="flex flex-col gap-1">
        <span className="text-slate-400 text-[10px] font-semibold tracking-wider">{label}</span>
        <div className="flex items-center gap-2 text-slate-900 text-xs font-medium">
            <Calendar size={14} className="text-amber-500" />
            <span>{dateText}</span>
        </div>
    </div>
)
