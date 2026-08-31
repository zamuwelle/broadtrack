import { Icon } from '@/components/ui/Icon'

const noop = () => null

export const OverdueAlert = ({
    overdueCount: propOverdueCount,
    count,
    pendingCount = 0,
    onViewDetails = noop,
    onGoToApprovals = noop
}) => {
    const overdueCount = propOverdueCount ?? count ?? 0

    const showOverdue = overdueCount > 0
    const showPending = pendingCount > 0

    const alerts = []

    if (showOverdue) {
        const desc =
            overdueCount === 1
                ? 'There is 1 equipment past its return deadline. Send a reminder to the borrower to arrange its return.'
                : `There are ${overdueCount} equipments past their return deadline. Send a reminder to the borrowers to arrange their return.`

        alerts.push({
            id: 'overdue',
            icon: 'clock',
            title: 'Action Required: Overdue Equipment',
            description: desc,
            buttonText: 'View Details →',
            handleAction: onViewDetails
        })
    }

    if (showPending) {
        const desc =
            pendingCount === 1
                ? 'There is 1 borrower request awaiting verification. Confirm equipment availability to proceed.'
                : `There are ${pendingCount} borrower requests awaiting verification. Confirm equipment availability to proceed.`

        alerts.push({
            id: 'pending',
            icon: 'danger',
            title: 'Action Required: Pending Reservations',
            description: desc,
            buttonText: 'Go to Approvals',
            handleAction: onGoToApprovals
        })
    }

    const hasStack = alerts.length > 1
    const currentAlert = alerts[0]

    if (!currentAlert) {
        return (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 font-['Poppins']">
                <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-amber-500 flex items-center justify-center">
                        <Icon name="clock" className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-amber-800 text-base sm:text-lg font-semibold">
                            All Equipment on Schedule
                        </div>
                        <div className="text-amber-500 text-xs sm:text-sm font-normal">
                            There is currently no equipment past its return deadline.
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative font-['Poppins']">
            {hasStack && (
                <div
                    className="absolute inset-0 translate-x-1.5 translate-y-2 bg-amber-50 rounded-xl border border-amber-200 pointer-events-none transition-all duration-200"
                    aria-hidden="true"
                />
            )}

            <div className="relative z-10 bg-amber-50 rounded-xl border border-amber-200 p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
                <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-amber-500 flex items-center justify-center">
                        <Icon name={currentAlert.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-amber-800 text-base sm:text-lg font-semibold">{currentAlert.title}</div>
                        <div className="text-amber-500 text-xs sm:text-sm font-normal">{currentAlert.description}</div>
                    </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={currentAlert.handleAction}
                        className="w-full sm:w-36 h-9 sm:h-10 bg-amber-500 hover:bg-amber-600 transition-colors rounded-[10px] text-slate-50 text-xs sm:text-sm font-semibold inline-flex items-center justify-center cursor-pointer">
                        {currentAlert.buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}
