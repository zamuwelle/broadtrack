import { Link } from 'react-router-dom'

export default ({ to, children, className = '', variant = 'primary', ...props }) => {
	const cls = `flex items-center justify-center rounded-[8px] text-[16px] font-medium shadow-sm transition-all ${variant === 'primary' ? 'bg-primary text-surface hover:opacity-90' : 'bg-surface text-text hover:bg-background'} ${className}`

	return to ? <Link to={to} className={cls} {...props}>{children}</Link> : <button className={cls} {...props}>{children}</button>
}