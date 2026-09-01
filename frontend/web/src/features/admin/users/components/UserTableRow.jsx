import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDateTime } from '@shared/util/date'

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

    return (
        <tr className="hover:bg-slate-50/70 transition-colors h-14">
            <td className="px-3 py-2.5 text-xs text-slate-700 border-r border-slate-200 text-center">{index}</td>
            <td className="px-3 py-2.5 text-xs text-slate-900 border-r border-slate-200 capitalize">
                {user.firstname}
            </td>
            <td className="px-3 py-2.5 text-xs text-slate-900 border-r border-slate-200 capitalize">{user.lastname}</td>
            <td className="px-3 py-2.5 text-xs text-slate-700 border-r border-slate-200">{user.email}</td>
            <td className="px-3 py-2.5 border-r border-slate-200">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize inline-block ${badgeClass}`}>
                    {user.role}
                </span>
            </td>
            <td className="px-3 py-2.5 border-r border-slate-200">
                <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-lg inline-block">
                    {formatDateTime(user.created_at)}
                </span>
            </td>
            <td className="px-3 py-2.5 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleEdit}
                    className="hover:opacity-80 transition-opacity cursor-pointer">
                    <Icon name="userEdit" />
                </button>
                <button
                    type="button"
                    onClick={handleRemove}
                    className="hover:opacity-80 transition-opacity cursor-pointer">
                    <Icon name="userDelete" />
                </button>
            </td>
        </tr>
    )
}
