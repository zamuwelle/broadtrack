import { useCallback } from 'react'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useBorrowSummaryLogic } from '@/features/borrow/request/useBorrowSummaryLogic'
import { SubmittedView } from '@/features/borrow/request/components/SubmittedView'
import { EmptyView } from '@/features/borrow/request/components/EmptyView'
import { SummaryFormView } from '@/features/borrow/request/components/SummaryFormView'

const noop = () => null

export const BorrowSummaryModal = ({ isOpen = false, onClose = noop, onSelectTab = noop, user: propUser }) => {
    useEscapeKey(onClose)

    const {
        user,
        selectedItems,
        modalView,
        startDate,
        endDate,
        minStartDate,
        excludeDateIntervals,
        hasStartConflict,
        hasEndConflict,
        hasScheduleConflict,
        purpose,
        isSubmittable,
        isSubmitting,
        errorMessage,
        helperMessage,
        handleStartDateChange,
        handleEndDateChange,
        handleRemoveItem,
        handlePurposeChange,
        handleSubmit
    } = useBorrowSummaryLogic({ isOpen, propUser })

    const handleBrowse = useCallback(() => {
        onClose()
        onSelectTab('Equipment')
    }, [onClose, onSelectTab])

    const handleViewSlips = useCallback(() => {
        onClose()
        onSelectTab('My Slips')
    }, [onClose, onSelectTab])

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-['Poppins']">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                className="fixed inset-0 bg-black/40 border-none outline-none cursor-default"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-[560px]">
                {modalView === 'submitted' ? <SubmittedView onClose={onClose} onViewSlips={handleViewSlips} /> : null}

                {modalView === 'empty' ? <EmptyView onClose={onClose} onBrowse={handleBrowse} /> : null}

                {modalView === 'summary' ? (
                    <SummaryFormView
                        user={user}
                        selectedItems={selectedItems}
                        startDate={startDate}
                        endDate={endDate}
                        minStartDate={minStartDate}
                        excludeDateIntervals={excludeDateIntervals}
                        hasStartConflict={hasStartConflict}
                        hasEndConflict={hasEndConflict}
                        hasScheduleConflict={hasScheduleConflict}
                        purpose={purpose}
                        isSubmittable={isSubmittable}
                        isSubmitting={isSubmitting}
                        errorMessage={errorMessage}
                        helperMessage={helperMessage}
                        onClose={onClose}
                        onRemoveItem={handleRemoveItem}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        onPurposeChange={handlePurposeChange}
                        onSubmit={handleSubmit}
                    />
                ) : null}
            </div>
        </div>
    )
}
