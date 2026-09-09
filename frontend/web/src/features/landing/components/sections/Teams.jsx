import { useEffect, useRef } from 'react'
import lightImg from '@/assets/icons/landing/teams/light.png?inline'

const members = Object.freeze([
    { name: 'Ydrey Ann Ramirez', role: 'UI/UX Designer' },
    { name: 'Anne Stephanne Buenaflor', role: 'Business Analyst' },
    { name: 'Rocelyn Lava', role: 'Project Manager' },
    { name: 'Luisa Padillon', role: 'UI/UX Designer' },
    { name: 'Karl Ashton Mahusay', role: 'Quality Assurance' }
])

export const Teams = () => {
    const containerRef = useRef(null)
    const projectManagerRef = useRef(null)

    useEffect(() => {
        const centerProjectManager = () => {
            if (containerRef.current && projectManagerRef.current) {
                const container = containerRef.current
                const projectManager = projectManagerRef.current
                container.scrollLeft =
                    projectManager.offsetLeft - (container.clientWidth - projectManager.offsetWidth) / 2
            }
        }
        const frameId = requestAnimationFrame(centerProjectManager)
        globalThis.addEventListener('resize', centerProjectManager)
        return () => {
            cancelAnimationFrame(frameId)
            globalThis.removeEventListener('resize', centerProjectManager)
        }
    }, [])

    return (
        <section
            id="teams"
            className="min-h-screen py-16 sm:py-20 overflow-hidden teams-gradient flex items-center justify-center">
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
                <div className="flex flex-col items-center gap-2 text-center px-4 sm:px-8">
                    <p className="text-primary text-[16px] font-semibold">MEET THE DEVELOPERS</p>
                    <h2 className="text-text text-xl sm:text-[24px] font-semibold">
                        The team behind the <span className="text-primary">Broad</span>Track system.
                    </h2>
                </div>
                <div
                    ref={containerRef}
                    className="relative flex items-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12 mt-12 sm:mt-16 w-full overflow-x-auto px-6 sm:px-8 lg:px-0 lg:justify-center lg:overflow-visible snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {members.map((member) => (
                        <div
                            key={member.name}
                            ref={member.role === 'Project Manager' ? projectManagerRef : null}
                            className="relative w-[160px] lg:w-[180px] h-[430px] shrink-0 flex flex-col items-center text-center snap-center">
                            <div className="relative z-10 w-[118px] h-[118px] bg-gray-200" />
                            <p className="relative z-10 text-primary text-[15px] lg:text-[16px] font-bold uppercase leading-snug mt-6 min-h-[44px] flex items-center justify-center">
                                {member.name}
                            </p>
                            <p className="relative z-10 text-primary text-[14px] mt-1 font-medium">{member.role}</p>
                            <img
                                src={lightImg}
                                alt=""
                                decoding="sync"
                                className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[336px] max-w-none pointer-events-none z-0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
