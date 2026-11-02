import TeamCard from '@/components/landing/TeamCard'

export default () => (
	<section id="teams" className="min-h-screen py-20 overflow-hidden teams-gradient flex items-center justify-center">
		<div className="max-w-7xl mx-auto px-8 w-full flex flex-col items-center">
			<div className="flex flex-col items-center gap-2 text-center">
				<p className="text-primary text-[16px] font-semibold">MEET THE DEVELOPERS</p>
				<h2 className="text-text text-[24px] font-semibold">The team behind the <span className="text-primary">Broad</span>Track system.</h2>
			</div>
			<div className="flex justify-center items-center gap-[64px] xl:gap-[74px] mt-16 w-full">
				<TeamCard />
				<TeamCard />
				<TeamCard />
				<TeamCard />
				<TeamCard />
				<TeamCard />
			</div>
		</div>
	</section>
)