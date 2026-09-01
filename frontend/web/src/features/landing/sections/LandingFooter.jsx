import { Link } from 'react-router-dom'
import logoFooter from '@/assets/logo_footer.webp?inline'
import { Icon } from '@/components/ui/Icon'

const sections = Object.freeze([
    { heading: 'Features', lines: ['Explore what BroadTrack', 'can do.'] },
    {
        heading: 'How It Works',
        lines: ['Learn how BroadTrack', 'makes borrowing easier.']
    },
    { heading: 'Teams', lines: ['Get to know the team', 'behind BroadTrack.'] }
])

const legalLink = 'text-[14px] text-gray-300 hover:text-surface transition-colors'
const iconCircle =
    'inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-full text-gray-300 hover:text-surface hover:border-surface transition-colors'

export const LandingFooter = () => (
    <footer className="bg-primary min-h-[318px] flex flex-col justify-between">
        <div className="flex-1 flex items-center py-10 lg:py-0">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-0">
                <Link to="/" className="inline-flex items-center gap-3 sm:gap-[18px] max-w-full">
                    <img
                        src={logoFooter}
                        alt="BroadTrack"
                        width={128}
                        decoding="sync"
                        className="w-[72px] sm:w-[128px] h-auto shrink-0"
                    />
                    <div className="flex flex-col text-left min-w-0">
                        <p className="text-[16px] font-bold text-surface">BroadTrack</p>
                        <p className="text-[14px] sm:text-[15px] font-normal leading-relaxed text-gray-300">
                            <span className="sm:whitespace-nowrap">The smartest way to track and manage</span>
                            <br className="hidden sm:inline" /> <span className="sm:whitespace-nowrap">equipment.</span>
                        </p>
                    </div>
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 lg:gap-0">
                    {sections.map(({ heading, lines }) => (
                        <div
                            key={heading}
                            className="flex flex-col text-left gap-1 sm:gap-2 p-2 sm:p-4 lg:p-5 hover:bg-footer-hover transition-colors">
                            <p className="text-[16px] font-bold text-surface">{heading}</p>
                            <p className="text-[14px] sm:text-[15px] font-normal leading-relaxed text-gray-300">
                                <span className="sm:whitespace-nowrap">{lines[0]}</span>
                                <br className="hidden sm:inline" />{' '}
                                <span className="sm:whitespace-nowrap">{lines[1]}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="w-full h-px bg-gray-300" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full py-6 lg:py-[38px] flex flex-col sm:flex-row items-center justify-between lg:justify-center gap-6 lg:gap-[112px]">
            <div className="flex items-center gap-6 sm:gap-8">
                <Link to="/privacy" className={legalLink}>
                    Privacy Policy
                </Link>
                <Link to="/terms" className={legalLink}>
                    Terms of Service
                </Link>
            </div>
            <p className="text-[14px] text-gray-300 order-last sm:order-none">© 2026 BroadTrack</p>
            <div className="flex items-center gap-6 sm:gap-8">
                <a
                    href="https://www.facebook.com/lvcc.broadssoc"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className={iconCircle}>
                    <Icon name="facebook" className="w-[18px] h-[18px]" />
                </a>
                <a
                    href="https://www.instagram.com/lvcc.broadssoc"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={iconCircle}>
                    <Icon name="instagram" className="w-[18px] h-[18px]" />
                </a>
            </div>
        </div>
    </footer>
)
