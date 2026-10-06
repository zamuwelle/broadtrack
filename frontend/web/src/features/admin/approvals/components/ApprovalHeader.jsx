import { ApprovalStatusLine } from '@/features/admin/approvals/components/ApprovalStatusLine'

const defaultBooking = Object.freeze({})

export const ApprovalHeader = ({ booking = defaultBooking, showStatus = true }) => {
    const equipments = booking.equipments || []
    const equipment = equipments[0] || defaultBooking
    const equipmentName = equipment.name || 'Equipment'
    const categoryName = typeof equipment.category === 'string' ? equipment.category : equipment.category?.name || ''
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 w-full">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                <h3 className="text-lg max-[374px]:text-base font-semibold text-slate-900 leading-tight">
                    {equipmentName}
                </h3>
                {categoryName ? (
                    <div className="inline-flex items-center justify-center min-w-[56px] h-5 px-2.5 bg-white border border-slate-300 rounded-xl">
                        <span className="text-[10px] text-slate-700 font-normal leading-none text-center">
                            {categoryName}
                        </span>
                    </div>
                ) : null}
            </div>

            {showStatus ? <ApprovalStatusLine booking={booking} /> : null}
        </div>
    )
}
