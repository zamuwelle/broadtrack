import { getFullName } from '@shared/util/name'
import { Icon } from '@/components/ui/Icon'

const noop = () => null

export const BorrowerDetailsCard = ({ user, onEdit = noop }) => (
    <div className="flex w-full flex-col items-end justify-start gap-3 rounded-lg bg-zinc-100/40 p-4 outline outline-1 outline-offset-[-1px] outline-slate-300">
        <div className="inline-flex w-full items-start justify-between">
            <span className="text-xs font-normal text-neutral-400">BORROWER DETAILS</span>
            <button type="button" onClick={onEdit} className="size-4 cursor-pointer hover:opacity-80">
                <Icon name="edit" className="size-4" />
            </button>
        </div>
        <div className="flex w-full flex-col items-start justify-start gap-1 text-xs font-normal text-text">
            <div>Name: {getFullName(user) || user?.name || 'User Name'}</div>
            <div>Email: {user?.email || 'user.email@student.laverdad.edu.ph'}</div>
            <div>Phone: {user?.phone || '+63 9xx xxx xxxx'}</div>
            <div>Department: {user?.department || 'BS Information Systems'}</div>
        </div>
    </div>
)
