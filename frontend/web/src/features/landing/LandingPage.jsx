import { QuickContact } from '@/features/landing/components/contact/QuickContact'
import { Features } from '@/features/landing/components/sections/Features'
import { Hero } from '@/features/landing/components/sections/Hero'
import { HowItWorks } from '@/features/landing/components/sections/HowItWorks'
import { Teams } from '@/features/landing/components/sections/Teams'

export const LandingPage = () => (
    <>
        <QuickContact />
        <Hero />
        <Features />
        <HowItWorks />
        <Teams />
    </>
)
