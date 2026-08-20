import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Teams } from '@/components/landing/Teams'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { QuickContact } from '@/components/landing/QuickContact'

export const Landing = () => (
    <>
        <QuickContact />
        <Hero />
        <Features />
        <HowItWorks />
        <Teams />
        <LandingFooter />
    </>
)
