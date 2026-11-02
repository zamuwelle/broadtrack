import Logo from './Logo'
import HomeLinks from './HomeLinks'
import HomeCTA from './HomeCTA'
import useScrollDirection from '@/hooks/useScrollDirection'

export default ({ onOpenLogin, onOpenRegister }) => {
	const { scrollDirection, isAtTop } = useScrollDirection()

	return (
		<nav
			className={`fixed top-0 left-0 w-full h-20 z-40 transition-all duration-150 ease-in bg-white ${scrollDirection === 'down' && !isAtTop ? '-translate-y-full shadow-none' : 'translate-y-0 shadow-sm'}`}
		>
			<div className="max-w-7xl mx-auto px-8 w-full h-full flex items-center justify-between">
				<Logo />
				<HomeLinks />
				<HomeCTA onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} />
			</div>
		</nav>
	)
}