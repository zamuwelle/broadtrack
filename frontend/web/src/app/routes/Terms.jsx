import { useOutletContext } from 'react-router-dom'
import { LandingFooter } from '@/features/landing/sections/LandingFooter'
import { LandingNavbar } from '@/features/landing/nav/LandingNavbar'

const sections = Object.freeze([
    Object.freeze({
        heading: '1. Institutional Eligibility',
        body: 'Access to BroadTrack is restricted to verified students, faculty, and authorized personnel of La Verdad Christian College with an active institutional email address (@student.laverdad.edu.ph or @laverdad.edu.ph).'
    }),
    Object.freeze({
        heading: '2. Equipment Borrowing & Responsibility',
        body: 'Borrowers assume full responsibility for all broadcast equipment checked out under their account. Equipment must be returned in good working condition by the designated due date and time.'
    }),
    Object.freeze({
        heading: '3. Account Security',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. Sharing your account or borrowing equipment on behalf of unauthorized third parties is strictly prohibited.'
    }),
    Object.freeze({
        heading: '4. Damage and Loss Policy',
        body: 'Any damage, malfunction, or loss of equipment must be reported immediately to the broadcast department administrators. Borrowers may be held liable for negligent damage or unreturned items.'
    })
])

export const TermsRoute = () => {
    const { onOpenLogin, onOpenRegister } = useOutletContext()

    return (
        <div className="bg-bg">
            <LandingNavbar onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} />
            <section className="min-h-screen pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-8">
                    <h1 className="text-[40px] font-bold text-text mb-2">Terms of Service</h1>
                    <p className="text-[14px] text-text/60 mb-10">Last updated: August 28, 2026</p>
                    <div className="flex flex-col gap-8 text-text/80 text-[15px] max-w-[840px]">
                        {sections.map(({ heading, body }) => (
                            <div key={heading}>
                                <h2 className="text-[18px] font-semibold text-text mb-2">{heading}</h2>
                                <p className="leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <LandingFooter />
        </div>
    )
}
