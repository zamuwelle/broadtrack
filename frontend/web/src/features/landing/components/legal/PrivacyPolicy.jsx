const sections = Object.freeze([
    Object.freeze({
        heading: '1. Information We Collect',
        body: 'BroadTrack collects your name, La Verdad institutional email, contact number, department affiliation, and equipment borrowing activity records for institutional inventory and accountability purposes.'
    }),
    Object.freeze({
        heading: '2. Google Account Information',
        body: 'When authenticating through Google, we only access your basic profile information (name and verified institutional email) for seamless identity verification and single sign-on.'
    }),
    Object.freeze({
        heading: '3. How We Use Your Data',
        body: 'Collected data is used strictly for managing equipment checkouts, tracking reservation statuses, automated return reminders, and maintaining inventory auditing records within La Verdad Christian College.'
    }),
    Object.freeze({
        heading: '4. Data Protection',
        body: 'We do not sell, rent, or share personal information with any third-party commercial entities. All data is securely stored and accessible only to authorized broadcast laboratory custodians.'
    })
])

export const PrivacyPolicy = () => (
    <section className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-[40px] font-bold text-text mb-2">Privacy Policy</h1>
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
)
