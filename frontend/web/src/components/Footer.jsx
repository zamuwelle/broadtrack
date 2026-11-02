import { Link } from 'react-router-dom'
import logoFooter from '@/assets/logo_footer.webp'

const FacebookIcon = props => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>
const InstagramIcon = props => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>

const sections = [
	{ heading: 'Features', lines: ['Explore what BroadTrack', 'can do.'] },
	{ heading: 'How It Works', lines: ['Learn how BroadTrack', 'makes borrowing easier.'] },
	{ heading: 'Teams', lines: ['Get to know the team', 'behind BroadTrack.'] }
]

const TextBlock = ({ heading, lines, className = '' }) => (
	<div className={`flex flex-col text-left ${className}`}>
		<p className="text-[16px] font-bold text-surface">{heading}</p>
		<p className="text-[15px] font-normal leading-relaxed text-gray-300">
			<span className="whitespace-nowrap">{lines[0]}</span><br />
			<span className="whitespace-nowrap">{lines[1]}</span>
		</p>
	</div>
)

const legalLink = 'text-[14px] text-gray-300 hover:text-surface transition-colors'
const iconCircle = 'inline-flex items-center justify-center p-1 border border-gray-300 rounded-full text-gray-300 hover:text-surface hover:border-surface transition-colors'

export default () => (
	<footer className="bg-primary h-[318px] flex flex-col">
		<div className="flex-1 flex items-center">
			<div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
				<Link to="/" className="inline-flex items-center gap-[18px]">
					<img src={logoFooter} alt="BroadTrack" className="w-[128px] h-auto" />
					<TextBlock heading="BroadTrack" lines={['The smartest way to track and manage', 'equipment.']} />
				</Link>
				{sections.map(section => <TextBlock key={section.heading} {...section} className="gap-2" />)}
			</div>
		</div>
		<div className="w-full h-px bg-gray-300" />
		<div className="max-w-7xl mx-auto px-8 w-full py-[38px] flex items-center justify-center gap-[112px]">
			<div className="flex items-center gap-8">
				<Link to="/privacy" className={legalLink}>Privacy Policy</Link>
				<Link to="/terms" className={legalLink}>Terms of Service</Link>
			</div>
			<p className="text-[14px] text-gray-300">© 2026 BroadTrack</p>
			<div className="flex items-center gap-8">
				<a href="#" aria-label="Facebook" className={iconCircle}><FacebookIcon className="w-[18px] h-[18px]" /></a>
				<a href="#" aria-label="Instagram" className={iconCircle}><InstagramIcon className="w-[18px] h-[18px]" /></a>
			</div>
		</div>
	</footer>
)