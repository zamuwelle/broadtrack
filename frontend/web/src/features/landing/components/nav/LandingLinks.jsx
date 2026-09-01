import { useLocation } from 'react-router-dom'
import { landingLinks } from '@/features/landing/components/nav/landingNavLinks'
import { useActiveSection } from '@/hooks/ui/useActiveSection'

export const LandingLinks = () => {
    const { pathname } = useLocation()
    const activeSection = useActiveSection()
    const active = pathname === '/' ? activeSection : ''

    return (
        <div className="flex items-center gap-8">
            {landingLinks.map(({ href, id, label }) => (
                <a
                    key={id}
                    href={href}
                    className={`text-text text-[16px] font-semibold pb-[2px] hover:text-primary ${active === id ? 'text-primary border-b-2 border-primary' : 'border-b-2 border-transparent'}`}>
                    {label}
                </a>
            ))}
        </div>
    )
}
