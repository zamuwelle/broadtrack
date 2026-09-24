import { cn } from 'cn'
import { Icon } from '@/components/ui/Icon'

export const XButton = ({ className = '', ...rest }) => (
    <button
        type="button"
        aria-label="Close"
        className={cn('text-icon-subtle hover:text-text transition-colors cursor-pointer', className)}
        {...rest}>
        <Icon name="xButton" fill="currentColor" />
    </button>
)
