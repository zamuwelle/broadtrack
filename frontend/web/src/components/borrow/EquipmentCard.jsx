import { useState, useRef } from 'react'
import StatusBadge from '@/components/borrow/StatusBadge'
import CategoryBadge from '@/components/borrow/CategoryBadge'
import ViewDetailsButton from '@/components/borrow/ViewDetailsButton'
import XButton from '@/components/borrow/XButton'
import ScheduleNotice from '@/components/borrow/ScheduleNotice'
import SelectButton from '@/components/borrow/SelectButton'

export default ({ equipment }) => {
	const [expanded, setExpanded] = useState(false)
	const [visible, setVisible] = useState(true)
	const cardRef = useRef(null)

	const modelName = [equipment.brand, equipment.model].filter(Boolean).join(' ')
	const specLines = (equipment.specs ?? '').split('\n').filter(Boolean)

	const toggle = (target) => {
		const siblings = [...cardRef.current.parentElement.children].filter((sibling) => sibling !== cardRef.current)
		const beforeTops = new Map(siblings.map((sibling) => [sibling, sibling.getBoundingClientRect().top]))
		setVisible(false)
		setTimeout(() => {
			setExpanded(target)
			setVisible(true)
			requestAnimationFrame(() => requestAnimationFrame(() => {
				siblings.forEach((sibling) => {
					const delta = beforeTops.get(sibling) - sibling.getBoundingClientRect().top
					if (delta) sibling.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
				})
				if (target) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
			}))
		}, 80)
	}

	const imageView = equipment.image
		? <img src={equipment.image.replace('/upload/', '/upload/f_auto,q_auto/')} alt={equipment.name} className="h-full w-full object-cover" />
		: null

	if (expanded) return (
		<div ref={cardRef} className={`scroll-mb-[24px] w-full overflow-hidden rounded-[8px] border border-[#CFD7E0] bg-surface shadow-[0px_4px_4px_rgba(0,0,0,0.05)] transition-opacity ${visible ? 'duration-200 opacity-100' : 'duration-80 opacity-0'}`}>
			<div className="relative flex h-[267px] items-start justify-end gap-[14px] border-b border-[#CFD7E0] bg-[#959595] pr-[19px] pt-[22px]">
				<div className="absolute inset-0">{imageView}</div>
				<SelectButton className="relative" />
				<XButton onClick={() => toggle(false)} className="relative flex h-[30px] w-[30px] items-center justify-center" />
			</div>
			<div className="flex flex-col gap-[10px] px-[26px] py-[28px]">
				<div className="flex items-start justify-between">
					<p className="text-[18.17px] font-semibold">{equipment.name}</p>
					<CategoryBadge category={equipment.category?.name} />
				</div>
				<p className="text-[12px] text-[#8E8E93]">{modelName}</p>
				<div className="flex min-h-[72px] items-center justify-between rounded-[8px] border border-[#E5E5EA] bg-[#F4F4F4]/40 py-[10px] pl-[14px] pr-[15px]">
					<div className="flex flex-col gap-[2px]">
						<p className="text-[12px] text-[#8E8E93]">SERIAL NO</p>
						<p className="text-[12px] text-[#8E8E93]">{equipment.serial_no || '—'}</p>
					</div>
					<div className="flex w-[90px] flex-col items-center gap-[7px]">
						<p className="text-[12px] text-[#8E8E93]">AVAILABILITY</p>
						<StatusBadge status={equipment.status} className="self-stretch" />
					</div>
				</div>
				<p className="text-[14px] font-bold text-[#8E8E93]">PRODUCT SPECS</p>
				<ul className="list-disc pl-[20px] text-[14px] text-[#8E8E93]">
					{specLines.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
				</ul>
				<div className="h-0 border-t-[1.3px] border-[#E5E5EA]" />
				<div className="flex flex-col gap-[10px]">
					<p className="text-[14px] font-bold text-[#8E8E93]">ITEM BOOK SCHEDULE</p>
					<ScheduleNotice status={equipment.status} />
				</div>
			</div>
		</div>
	)

	return (
		<div ref={cardRef} className={`h-[371px] w-full overflow-hidden rounded-[8px] border border-[#CFD7E0] bg-surface shadow-[0px_4px_4px_rgba(0,0,0,0.05)] transition-opacity ${visible ? 'duration-200 opacity-100' : 'duration-80 opacity-0'}`}>
			<div className="relative flex h-[150px] items-start justify-end gap-[14px] border-b border-[#CFD7E0] bg-[#959595] pr-[21px] pt-[22px]">
				<div className="absolute inset-0">{imageView}</div>
				<StatusBadge status={equipment.status} className="relative" />
				<SelectButton className="relative" />
			</div>
			<div className="flex h-[221px] flex-col gap-[18px] px-[26px] py-[28px]">
				<div className="flex flex-col gap-[8px]">
					<p className="text-[18.17px] font-semibold">{equipment.name}</p>
					<p className="text-[12px] text-[#959595]">{modelName}</p>
					<p className="text-[12px] leading-snug text-[#959595]">{equipment.description}</p>
				</div>
				<div className="h-0 border-t border-[#E5E5EA]"/>
				<div className="flex items-center justify-between">
					<CategoryBadge category={equipment.category?.name} />
					<ViewDetailsButton onClick={() => toggle(true)} />
				</div>
			</div>
		</div>
	)
}