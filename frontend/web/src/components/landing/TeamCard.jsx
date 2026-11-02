import lightImg from '@/assets/icons/landing/teams/light.png'

export default ({ avatar, name = 'NAME NAME NAME', role = 'role role role', lightTop = 'top-[80px]' }) => (
	<div className="relative w-[118px] shrink-0 flex flex-col items-center">
		<div className="relative z-10 w-[118px] h-[118px] bg-gray-200">
			{avatar && <img src={avatar} alt={name} className="w-full h-full object-cover" />}
		</div>
		<p className="relative z-10 text-primary text-[16px] font-bold uppercase whitespace-nowrap mt-6">{name}</p>
		<p className="relative z-10 text-primary text-[14px] lowercase mt-1.5">{role}</p>
		<img src={lightImg} alt="" className={`absolute ${lightTop} left-1/2 -translate-x-1/2 w-[336px] max-w-none pointer-events-none z-0`} />
	</div>
)