import { useCallback } from 'react'
import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'
import { Select } from '@/components/ui/Select'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { DEPARTMENTS } from '@shared/constants'

export const ProfileInputField = ({ field, value = '', error = '', card = false, onValueChange, onErrorChange }) => {
    const { label, placeholder, icon, key, type, validate, readOnly, maxLength } = field

    const handleBlur = useCallback(
        (event) => {
            if (!validate) {
                return
            }
            onErrorChange(key, validate(event.target.value))
        },
        [key, validate, onErrorChange]
    )

    const handleChange = useCallback(
        (event) => {
            const nextValue = event.target.value
            onValueChange(key, nextValue)
            if (validate) {
                onErrorChange(key, validate(nextValue))
            }
        },
        [key, validate, onValueChange, onErrorChange]
    )

    const handleDepartmentChange = useCallback(
        (nextVal) => {
            onValueChange('department', nextVal)
            onErrorChange('department', '')
        },
        [onValueChange, onErrorChange]
    )

    const inputClass = card
        ? 'h-10 w-full rounded-lg bg-slate-50 px-3 outline outline-1 outline-offset-[-1px] outline-slate-300'
        : 'mt-1.5 w-[401px] h-10 bg-gray-100 border border-border-subtle rounded-[8px] px-3'

    return (
        <div className={cn('flex flex-col', card ? 'w-full' : 'w-[401px]')}>
            <label className={cn('text-[12px] font-normal text-text', card && 'mb-1.5')}>{label}</label>
            {key === 'department' ? (
                <Select
                    value={value}
                    onChange={handleDepartmentChange}
                    options={DEPARTMENTS}
                    placeholder="Select Department"
                    icon={icon}
                    wrapperClass={card ? 'w-full' : 'mt-1.5 w-[401px]'}
                    panelClass={card ? 'bg-slate-50 shadow-md' : 'bg-gray-100'}
                    className={cn(
                        'w-full h-10 px-3 gap-3 text-[12px] text-text',
                        card
                            ? 'rounded-lg bg-slate-50 outline outline-1 outline-offset-[-1px] outline-slate-300'
                            : 'bg-gray-100 border border-border-subtle rounded-[8px]'
                    )}
                    hoverClass={card ? 'hover:bg-slate-200' : 'hover:bg-disabled'}
                    selectedClass="bg-border-focus"
                />
            ) : (
                <div className={cn('flex items-center gap-3 text-text', inputClass)}>
                    <Icon name={icon} className="shrink-0" />
                    <div className="w-px h-6 bg-border-subtle" />
                    <input
                        type={type}
                        name={key}
                        placeholder={placeholder}
                        value={value}
                        readOnly={readOnly}
                        maxLength={maxLength}
                        autoComplete="off"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={cn(
                            'flex-1 bg-transparent text-[12px] outline-none placeholder:text-neutral-400',
                            readOnly ? 'text-subtext cursor-not-allowed' : 'text-text'
                        )}
                    />
                </div>
            )}
            <ErrorText message={error} />
        </div>
    )
}
