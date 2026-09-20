import { getOptimizedImageUrl } from '@shared/util/image'

const defaultEquipments = Object.freeze([])

export const SlipEquipmentList = ({ equipments = defaultEquipments }) => (
    <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch justify-start text-sky-800 text-xs font-medium">REQUESTED EQUIPMENT/S</div>
        {equipments.map((item) => {
            const categoryName = typeof item.category === 'string' ? item.category : item.category?.name || ''
            return (
                <div
                    key={item.id}
                    className="w-full h-16 bg-white rounded-lg outline outline-[0.50px] outline-slate-300 flex items-center overflow-hidden shrink-0">
                    <div className="w-24 h-16 relative shrink-0 bg-white border-r border-slate-200 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                            <img
                                className="w-24 h-16 left-0 top-0 absolute object-contain p-1"
                                src={getOptimizedImageUrl(item.image, 200)}
                                alt={item.name}
                                loading="eager"
                                decoding="async"
                            />
                        ) : null}
                    </div>
                    <div className="flex-1 px-4 inline-flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch justify-start text-slate-900 text-xs font-semibold">
                            {item.name}
                        </div>
                        <div className="self-stretch justify-start text-neutral-400 text-xs font-normal">
                            {[item.brand || categoryName, item.serial_no].filter(Boolean).join(' • ') ||
                                item.serial_no ||
                                ''}
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
)
