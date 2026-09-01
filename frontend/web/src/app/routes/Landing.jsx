import { useOutletContext } from 'react-router-dom'
import { Hero } from '@/features/landing/sections/Hero'
import { Features } from '@/features/landing/sections/Features'
import { HowItWorks } from '@/features/landing/sections/HowItWorks'
import { Teams } from '@/features/landing/sections/Teams'
import { LandingFooter } from '@/features/landing/sections/LandingFooter'
import { QuickContact } from '@/features/landing/contact/QuickContact'
import { LandingNavbar } from '@/features/landing/nav/LandingNavbar'

export const LandingRoute = () => {
    const { onOpenLogin, onOpenRegister } = useOutletContext()

    return (
        <>
            <LandingNavbar onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} />
            <QuickContact />
            <Hero />
            <Features />
            <HowItWorks />
            <Teams />
            <LandingFooter />
        </>
    )
}
