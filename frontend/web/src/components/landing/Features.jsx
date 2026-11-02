import FeatureCard from '@/components/landing/FeatureCard'
import features from '@/components/landing/features'

export default () => (
	<section id="features" className="min-h-screen py-20 flex items-center justify-center overflow-x-hidden features-gradient">
		<div className="max-w-7xl mx-auto px-8 w-full">
			<div className="flex justify-center gap-8">
				{features.map((feature) => (
					<FeatureCard key={feature.title} {...feature} />
				))}
			</div>
		</div>
	</section>
)