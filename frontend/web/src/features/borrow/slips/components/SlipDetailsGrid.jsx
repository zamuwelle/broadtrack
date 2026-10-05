import { Icon } from '@/components/ui/Icon'
import { formatDate } from '@shared/util/date'

export const SlipDetailsGrid = ({ borrowerName, borrowerDepartment, startDate, endDate }) => (
    <>
        <div className="self-stretch inline-flex justify-start items-center gap-4 lg:gap-8">
            <div className="w-48 min-w-0 flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">BORROWER:</div>
                <div className="self-stretch justify-start text-slate-900 text-xs font-semibold">{borrowerName}</div>
            </div>
            <div className="w-52 min-w-0 flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">DEPARTMENT:</div>
                <div className="self-stretch justify-start text-slate-900 text-xs font-semibold">
                    {borrowerDepartment}
                </div>
            </div>
        </div>

        <div className="self-stretch inline-flex justify-start items-center gap-4 lg:gap-8">
            <div className="w-48 min-w-0 flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">START DATE:</div>
                <div className="self-stretch inline-flex justify-start items-center gap-1.5 mt-0.5">
                    <Icon name="calendar" className="size-4 shrink-0" />
                    <div className="flex-1 min-w-0 justify-start text-slate-900 text-xs font-normal break-words">
                        {formatDate(startDate)}
                    </div>
                </div>
            </div>
            <div className="w-52 min-w-0 flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-neutral-400 text-xs font-medium">END DATE:</div>
                <div className="self-stretch inline-flex justify-start items-center gap-1.5 mt-0.5">
                    <Icon name="calendar" className="size-4 shrink-0" />
                    <div className="flex-1 min-w-0 justify-start text-slate-900 text-xs font-normal break-words">
                        {formatDate(endDate)}
                    </div>
                </div>
            </div>
        </div>
    </>
)
