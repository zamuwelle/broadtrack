import Logo from '@/components/Logo'

export default () => (
	<nav className="w-full h-20 bg-white shadow-sm">
		<div className="max-w-7xl mx-auto px-8 w-full h-full flex items-center">
			<Logo link={false} />
		</div>
	</nav>
)