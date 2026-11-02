import hero1 from '@/assets/hero1.webp'
import hero2 from '@/assets/hero2.webp'
import Badge from '@/components/landing/Badge'
import Button from '@/components/Button'

export default ({ onOpenLogin }) => (
	<section id="home" className="min-h-screen pt-20 pb-12 flex items-center justify-center overflow-x-hidden hero-gradient">
		<div className="max-w-7xl mx-auto px-8 w-full">
			<div className="flex items-center justify-between gap-12">
				<div className="flex flex-col items-start gap-6 max-w-[720px]">
					<Badge />
					<h1 className="text-text text-[64px] font-bold leading-tight">
						<span className="whitespace-nowrap">Streamline Your</span>
						<br />
						<span className="whitespace-nowrap"><span className="text-primary">Equipment</span> Logistics</span>
					</h1>
					<p className="text-text text-[18px]">
						A centralized inventory and borrowing ecosystem designed<br />
						for high-density broadcast operations. Precision tracking for<br />
						professional media assets.
					</p>
					<div className="flex items-center gap-24 mt-6">
						<div className="w-[256px] shrink-0" />
						<Button onClick={onOpenLogin} className="w-[196px] h-[48px]">Browse Equipment</Button>
					</div>
				</div>
				<div className="relative shrink-0 w-[416px] h-[416px]">
					<div className="absolute inset-0 z-0">
						<img src={hero2} alt="Hero back" className="mt-[36px] ml-[30px] w-full h-full object-cover rotate-[15deg] origin-center" />
					</div>
					<div className="absolute inset-0 z-10">
						<img src={hero1} alt="Hero front" className="w-full h-full object-cover rotate-[5deg] origin-center" />
					</div>
				</div>
			</div>
		</div>
	</section>
)