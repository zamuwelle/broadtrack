import { useCallback, useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LandingCta } from '@/features/landing/nav/LandingCta'
import { LandingLinks } from '@/features/landing/nav/LandingLinks'
import { landingLinks } from '@/features/landing/nav/landingNavLinks'
import { Logo } from '@/components/ui/Logo'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useScrollDirection } from '@/hooks/ui/useScrollDirection'

export const LandingNavbar = ({ onOpenLogin, onOpenRegister }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { scrollDirection, isAtTop } = useScrollDirection()

    useEffect(() => {
        const mediaQuery = globalThis.matchMedia('(min-width: 768px)')
        const handleMediaChange = (event) => {
            if (event.matches) {
                setIsMenuOpen(false)
            }
        }
        mediaQuery.addEventListener('change', handleMediaChange)
        return () => mediaQuery.removeEventListener('change', handleMediaChange)
    }, [])

    const handleNavClick = useCallback(() => {
        setIsMenuOpen(false)
    }, [])

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((prev) => !prev)
    }, [])

    const handleRegisterClick = useCallback(() => {
        setIsMenuOpen(false)
        onOpenRegister()
    }, [onOpenRegister])

    const handleLoginClick = useCallback(() => {
        setIsMenuOpen(false)
        onOpenLogin()
    }, [onOpenLogin])

    useEscapeKey(handleNavClick)

    return (
        <nav
            className={`fixed top-0 left-0 w-full h-16 md:h-20 z-40 transition-all duration-150 ease-in bg-white ${scrollDirection === 'down' && !isAtTop ? '-translate-y-full shadow-none' : 'translate-y-0 shadow-sm'}`}>
            <div className="w-full px-6 md:px-12 lg:px-[90px] h-full flex items-center justify-between">
                <div className="flex-1 flex items-center justify-start">
                    <Logo />
                </div>
                <div className="hidden md:flex items-center justify-center">
                    <LandingLinks />
                </div>
                <div className="hidden md:flex flex-1 items-center justify-end">
                    <LandingCta onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} />
                </div>
                <div className="flex md:hidden items-center">
                    <button
                        type="button"
                        aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
                        onClick={toggleMenu}
                        className="p-2 rounded-lg text-text hover:bg-slate-100 transition-colors cursor-pointer">
                        {isMenuOpen ? <X className="size-6 text-text" /> : <Menu className="size-6 text-text" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close mobile navigation"
                        className="fixed inset-0 top-16 md:top-20 bg-black/30 backdrop-blur-xs z-30 md:hidden border-none outline-none"
                        onClick={handleNavClick}
                    />
                    <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 flex flex-col gap-4 z-40 md:hidden">
                        <div className="flex flex-col gap-1">
                            {landingLinks.map(({ href, label }) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={handleNavClick}
                                    className="px-3 py-2.5 rounded-lg text-[16px] font-semibold text-text hover:text-primary hover:bg-slate-50 transition-colors">
                                    {label}
                                </a>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100" />
                        <LandingCta
                            onOpenLogin={handleLoginClick}
                            onOpenRegister={handleRegisterClick}
                            className="flex flex-col gap-2.5"
                            buttonClassName="w-full h-11"
                            loginClassName="border border-border-subtle"
                        />
                    </div>
                </>
            )}
        </nav>
    )
}
