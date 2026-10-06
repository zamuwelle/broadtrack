import { useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDateTime } from '@shared/util/date'
import { DEPARTMENT_SHORTHANDS } from '@shared/constants'

export const UserCard = ({ user, onEdit, onRemove }) => {
    const handleEdit = useCallback(() => onEdit(user), [onEdit, user])
    const handleRemove = useCallback(() => onRemove(user), [onRemove, user])
    return (
        <article className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 capitalize">
                    {user.firstname} {user.lastname}
                </h3>
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        aria-label={`Edit ${user.firstname} ${user.lastname} (${user.email})`}
                        onClick={handleEdit}>
                        <Icon name="userEdit" />
                    </button>
                    <button
                        type="button"
                        aria-label={`Delete ${user.firstname} ${user.lastname} (${user.email})`}
                        onClick={handleRemove}>
                        <Icon name="userDelete" />
                    </button>
                </div>
            </div>
            <dl className="mt-3 text-sm [&>div]:grid [&>div]:grid-cols-[100px_minmax(0,1fr)] [&>div]:gap-2 [&>div]:px-2 [&>div]:py-2 [&>div:nth-child(odd)]:bg-slate-50 [&_dt]:text-slate-600 [&_dd]:break-words">
                <div>
                    <dt>Email</dt>
                    <dd className="[overflow-wrap:anywhere]">{user.email}</dd>
                </div>
                <div>
                    <dt>Department</dt>
                    <dd>
                        {user.department_shorthand || DEPARTMENT_SHORTHANDS[user.department] || user.department || '—'}
                    </dd>
                </div>
                <div>
                    <dt>Role</dt>
                    <dd className="capitalize">{user.role}</dd>
                </div>
                <div>
                    <dt>Date Created</dt>
                    <dd>{formatDateTime(user.created_at)}</dd>
                </div>
            </dl>
        </article>
    )
}
