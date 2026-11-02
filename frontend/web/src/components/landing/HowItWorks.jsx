import { topRow, bottomRow } from '@/components/landing/procedures'

const Circle = ({ number }) => (
	<div className="w-[80px] h-[80px] flex items-center justify-center rounded-full bg-primary shadow-procedure">
		<span className="text-surface text-[24px] font-semibold">{number}</span>
	</div>
)

const CardStep = ({ number, icon, title, description, iconSize }) => (
	<div className="flex flex-col items-center gap-2 w-full max-w-[340px]">
		<Circle number={number} />
		<img src={icon} alt={title} className={iconSize} />
		<h3 className="text-text text-[18px] font-bold">{title}</h3>
		<p className="text-text text-[14px] text-center whitespace-pre-line">{description}</p>
	</div>
)

export default () => (
	<section id="how-it-works" className="min-h-screen py-20 flex items-center justify-center overflow-x-hidden features-gradient">
		<div className="max-w-7xl mx-auto px-8 w-full flex flex-col gap-12">
			<div className="flex flex-col items-center gap-2 text-center">
				<p className="text-primary text-[16px]">How it works?</p>
				<h2 className="text-text text-[24px] font-semibold">A simpler way to borrow, track, and return equipment.</h2>
			</div>
			<div className="flex flex-col gap-16">
				<div className="flex justify-between gap-8">
					{topRow.map((step) => (
						<CardStep key={step.number} {...step} />
					))}
				</div>
				<div className="flex justify-between gap-8">
					{bottomRow.map((step) => (
						<CardStep key={step.number} {...step} />
					))}
				</div>
			</div>
		</div>
	</section>
)