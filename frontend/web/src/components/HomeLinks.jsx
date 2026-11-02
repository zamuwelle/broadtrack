import { useLocation } from 'react-router-dom'
import useActiveSection from '@/hooks/useActiveSection'

const links = [
	{ href: '/#features', id: 'features', label: 'Features' },
	{ href: '/#how-it-works', id: 'how-it-works', label: 'How It Works' },
	{ href: '/#teams', id: 'teams', label: 'Teams' }
]

export default () => {
	const { pathname } = useLocation()
	const activeSection = useActiveSection()
	const active = pathname === '/' ? activeSection : ''

	return (
		<div className="flex items-center gap-8">
			{links.map(({ href, id, label }) => (
				<a
					key={id}
					href={href}
					className={`text-text text-[16px] font-semibold pb-[2px] hover:text-primary ${active === id ? 'text-primary border-b-2 border-primary' : 'border-b-2 border-transparent'}`}
				>
					{label}
				</a>
			))}
		</div>
	)
}