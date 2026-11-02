import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Teams from '@/components/landing/Teams'
import Footer from '@/components/Footer'
import QuickContact from '@/components/landing/QuickContact'

export default ({ onOpenLogin }) => (
	<>
		<QuickContact />
		<Hero onOpenLogin={onOpenLogin} />
		<Features />
		<HowItWorks />
		<Teams />
		<Footer />
	</>
)