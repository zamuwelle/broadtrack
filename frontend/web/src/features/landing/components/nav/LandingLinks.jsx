import { useLocation } from 'react-router-dom'
import { cn } from 'cn'
import { landingLinks } from '@/features/landing/components/nav/landingNavLinks'
import { useActiveSection } from '@/hooks/ui/useActiveSection'

export const LandingLinks = () => {
    const { pathname } = useLocation()
    const activeSection = useActiveSection(pathname)
    const active = pathname === '/' ? activeSection : ''

    return (
        <div className="flex items-center gap-8">
            {landingLinks.map(({ href, id, label }) => (
                <a
                    key={id}
                    href={href}
                    className={cn('text-text text-[16px] font-semibold pb-[2px] hover:text-primary', {
                        'text-primary': active === id
                    })}>
                    {label}
                </a>
            ))}
        </div>
    )
}
