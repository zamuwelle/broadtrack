import hero1 from '@/assets/hero1.webp?inline'
import hero2 from '@/assets/hero2.webp?inline'

export const Hero = () => (
    <section
        id="home"
        className="min-h-screen pt-28 pb-12 lg:pt-20 flex items-center justify-center overflow-x-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-12">
                <div className="flex flex-col items-start text-left gap-5 lg:gap-6 max-w-[720px]">
                    <div className="w-fit lg:w-[256px] h-auto lg:h-[48px] px-3.5 py-1.5 lg:px-0 lg:py-0 flex items-center justify-center rounded-full lg:rounded-[8px] bg-primary-tint text-text text-[13px] sm:text-[14px] lg:text-[16px] font-semibold border border-secondary shrink-0">
                        BROADCASTING DEPARTMENT
                    </div>
                    <h1 className="text-text text-[36px] sm:text-[48px] lg:text-[64px] font-bold leading-tight">
                        <span className="lg:whitespace-nowrap">Streamline Your</span>
                        <br className="hidden sm:inline" />{' '}
                        <span className="lg:whitespace-nowrap">
                            <span className="text-primary">Equipment</span> Logistics
                        </span>
                    </h1>
                    <p className="text-text/90 text-[15px] sm:text-[17px] lg:text-[18px] max-w-[560px] leading-relaxed">
                        A centralized inventory and borrowing ecosystem designed for high-density broadcast operations.
                        Precision tracking for professional media assets.
                    </p>
                </div>
                <div className="relative shrink-0 w-[290px] h-[290px] sm:w-[340px] sm:h-[340px] lg:w-[416px] lg:h-[416px] mt-6 lg:mt-0 self-center mx-auto lg:self-auto lg:mx-0">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={hero2}
                            alt="Hero back"
                            width={416}
                            height={416}
                            decoding="sync"
                            fetchPriority="high"
                            className="mt-4 ml-4 lg:mt-[36px] lg:ml-[30px] w-full h-full object-cover rotate-[6deg] lg:rotate-[15deg] origin-center"
                        />
                    </div>
                    <div className="absolute inset-0 z-10">
                        <img
                            src={hero1}
                            alt="Hero front"
                            width={416}
                            height={416}
                            decoding="sync"
                            fetchPriority="high"
                            className="w-full h-full object-cover rotate-0 lg:rotate-[5deg] origin-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
)
