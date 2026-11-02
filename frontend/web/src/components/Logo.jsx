import { Link } from 'react-router-dom'
import logo from '@/assets/logo.webp'

export default ({ link = true }) => {
	const content = (
		<>
			<img src={logo} alt="BroadTrack" width={64} height={64} />
			<p className="text-[24px] font-bold">
				<span className="text-primary">Broad</span>
				<span className="text-text">Track</span>
			</p>
		</>
	)

	return link
		? <Link to="/" className="flex items-center gap-2">{content}</Link>
		: <div className="flex items-center gap-2">{content}</div>
}