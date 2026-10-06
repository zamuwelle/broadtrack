import { useCallback } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'
import { formatDateTime } from '@shared/util/date'
import { DEPARTMENT_SHORTHANDS } from '@shared/constants'

const defaultUser = Object.freeze({})
const noop = () => null

const roleBadge = Object.freeze({
    borrower: 'bg-sky-800 text-white',
    admin: 'bg-blue-600 text-white',
    sysadmin: 'bg-purple-700 text-white'
})

export const UserTableRow = ({ user = defaultUser, index = 0, onEdit = noop, onRemove = noop }) => {
    const handleEdit = useCallback(() => {
        onEdit(user)
    }, [user, onEdit])

    const handleRemove = useCallback(() => {
        onRemove(user)
    }, [user, onRemove])

    const badgeClass = roleBadge[user.role] || 'bg-slate-200 text-slate-700'
    const deptShorthand = user.department_shorthand || DEPARTMENT_SHORTHANDS[user.department] || user.department

    return (
        <tr className="hover:bg-slate-50/70 transition-[background-color] h-14">
            <td className="px-3 py-2.5 text-xs text-slate-700 border-r border-slate-200 text-center">{index}</td>
            <td className="px-3 py-2.5 text-xs text-slate-900 border-r border-slate-200 capitalize">
                {user.firstname}
            </td>
            <td className="px-3 py-2.5 text-xs text-slate-900 border-r border-slate-200 capitalize">{user.lastname}</td>
            <td className="px-3 py-2.5 text-xs text-slate-700 border-r border-slate-200">{user.email}</td>
            <td className="px-3 py-2.5 border-r border-slate-200 text-center">
                {deptShorthand ? (
                    <span className="w-16 py-0.5 text-xs font-semibold bg-[#D3E8F8] text-[#144E75] rounded-md inline-block text-center">
                        {deptShorthand}
                    </span>
                ) : (
                    <span className="text-slate-500 font-medium">—</span>
                )}
            </td>
            <td className="px-3 py-2.5 border-r border-slate-200 text-center">
                <span
                    className={cn(
                        'w-20 py-0.5 text-xs font-medium rounded-full capitalize inline-block text-center',
                        badgeClass
                    )}>
                    {user.role}
                </span>
            </td>
            <td className="px-3 py-2.5 border-r border-slate-200 text-center">
                <span className="px-2.5 py-0.5 text-xs font-normal bg-slate-100/90 text-slate-700 rounded-full inline-block border border-slate-200/60">
                    {formatDateTime(user.created_at)}
                </span>
            </td>
            <td className="px-3 py-2.5 flex items-center justify-center gap-2">
                <button
                    type="button"
                    aria-label={`Edit ${user.firstname} ${user.lastname} (${user.email})`}
                    onClick={handleEdit}
                    className="hover:opacity-80 transition-opacity cursor-pointer">
                    <Icon name="userEdit" />
                </button>
                <button
                    type="button"
                    aria-label={`Delete ${user.firstname} ${user.lastname} (${user.email})`}
                    onClick={handleRemove}
                    className="hover:opacity-80 transition-opacity cursor-pointer">
                    <Icon name="userDelete" />
                </button>
            </td>
        </tr>
    )
}
