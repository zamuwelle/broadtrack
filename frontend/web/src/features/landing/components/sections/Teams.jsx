import { useEffect, useRef } from 'react'
import { cn } from 'cn'
import lightImg from '@/assets/icons/landing/teams/light.png?inline'
import member1 from '@/assets/teams/member-1.webp'
import member2 from '@/assets/teams/member-2.webp'
import member3 from '@/assets/teams/member-3.webp'
import member4 from '@/assets/teams/member-4.webp'
import member5 from '@/assets/teams/member-5.webp'
import member6 from '@/assets/teams/member-6.webp'

const members = Object.freeze([
    {
        name: 'Ydrey Ann Ramirez',
        role: 'UI/UX Designer',
        image: member1,
        scale: 'scale-125'
    },
    {
        name: 'Anne Stephanne Buenaflor',
        role: 'Business Analyst',
        image: member2,
        scale: 'scale-125'
    },
    {
        name: 'Rocelyn Lava',
        role: 'Project Manager',
        image: member3,
        scale: 'scale-125'
    },
    {
        name: 'Luisa Padillon',
        role: 'UI/UX Designer',
        image: member4,
        scale: 'scale-150 translate-y-1'
    },
    {
        name: 'Karl Ashton Mahusay',
        role: 'Quality Assurance',
        image: member5,
        scale: 'scale-100'
    },
    {
        name: 'Samuel Binos',
        role: 'Full-Stack Developer',
        image: member6,
        scale: 'scale-125'
    }
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
                    className="relative flex items-start gap-6 sm:gap-8 lg:gap-10 xl:gap-8 mt-12 sm:mt-16 w-full overflow-x-auto px-6 sm:px-8 lg:px-0 xl:justify-center snap-x snap-mandatory [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden!">
                    {members.map((member) => (
                        <div
                            key={member.name}
                            ref={member.role === 'Project Manager' ? projectManagerRef : null}
                            className="relative w-[160px] lg:w-[180px] h-[430px] shrink-0 flex flex-col items-center text-center snap-center">
                            <div className="relative z-10 w-[118px] h-[118px] overflow-hidden bg-gray-200">
                                <img
                                    src={member.image}
                                    alt=""
                                    loading="lazy"
                                    draggable={false}
                                    className={cn(
                                        'w-full h-full select-none object-cover object-top origin-top',
                                        member.scale
                                    )}
                                />
                            </div>
                            <p className="relative z-10 text-primary text-[15px] lg:text-[16px] font-bold uppercase leading-snug mt-6 min-h-[44px] flex items-start justify-center">
                                {member.name}
                            </p>
                            <p className="relative z-10 text-primary text-[14px] mt-1 font-medium">{member.role}</p>
                            <img
                                src={lightImg}
                                alt=""
                                decoding="sync"
                                draggable={false}
                                className="select-none absolute top-[80px] left-1/2 -translate-x-1/2 w-[336px] max-w-none pointer-events-none z-0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
