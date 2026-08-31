import { useOutletContext } from 'react-router-dom'
import { Hero } from '@/features/landing/components/Hero'
import { Features } from '@/features/landing/components/Features'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { Teams } from '@/features/landing/components/Teams'
import { LandingFooter } from '@/features/landing/components/LandingFooter'
import { QuickContact } from '@/features/landing/components/QuickContact'
import { LandingNavbar } from '@/features/landing/components/LandingNavbar'

export const LandingRoute = () => {
    const context = useOutletContext()

    return (
        <>
            <LandingNavbar onOpenLogin={context?.onOpenLogin} onOpenRegister={context?.onOpenRegister} />
            <QuickContact />
            <Hero />
            <Features />
            <HowItWorks />
            <Teams />
            <LandingFooter />
        </>
    )
}
