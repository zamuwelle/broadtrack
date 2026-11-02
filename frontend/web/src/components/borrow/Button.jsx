const variants = {
	ghost: 'bg-gray-100 text-text hover:bg-[#E5EBF2]',
	primary: 'bg-primary text-surface hover:bg-[#256BA6]',
	danger: 'bg-[#992C2C] text-surface hover:bg-[#EF4444]',
}

export default ({ variant = 'ghost', className = '', ...rest }) => (
	<button type="button" className={`w-[78px] h-[38px] rounded-[8px] text-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...rest} />
)