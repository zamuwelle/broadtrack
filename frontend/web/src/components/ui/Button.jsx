import { Link } from 'react-router-dom'
import { cn } from 'cn'

const variants = Object.freeze({
    primary: 'bg-primary text-surface hover:opacity-90 shadow-sm',
    secondary: 'bg-surface text-text hover:bg-background shadow-sm',
    ghost: 'bg-gray-100 text-text hover:bg-accent-subtle',
    danger: 'bg-danger text-surface hover:bg-danger-hover'
})

export const Button = ({ to, variant = 'primary', type = 'button', className = '', children, ...props }) => {
    const buttonClassName = cn(
        'flex items-center justify-center rounded-[8px] text-[16px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        className
    )
    if (to) {
        return (
            <Link to={to} className={buttonClassName} {...props}>
                {children}
            </Link>
        )
    }

    if (type === 'submit') {
        return (
            <button type="submit" className={buttonClassName} {...props}>
                {children}
            </button>
        )
    }

    if (type === 'reset') {
        return (
            <button type="reset" className={buttonClassName} {...props}>
                {children}
            </button>
        )
    }

    return (
        <button type="button" className={buttonClassName} {...props}>
            {children}
        </button>
    )
}
