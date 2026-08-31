import { useCallback } from 'react'
import { EditProfileForm } from '@/features/users/components/EditProfileForm'
import { XButton } from '@/components/ui/XButton'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useBorrowSummaryLogic } from '@/hooks/actions/useBorrowSummaryLogic'
import { SubmittedView } from '@/features/borrow/components/SubmittedView'
import { EmptyView } from '@/features/borrow/components/EmptyView'
import { SummaryFormView } from '@/features/borrow/components/SummaryFormView'

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
        hasScheduleConflict,
        purpose,
        specialNotes,
        isSubmittable,
        isSubmitting,
        errorMessage,
        handleStartDateChange,
        handleEndDateChange,
        handleRemoveItem,
        handleOpenEdit,
        handleCloseEdit,
        handlePurposeChange,
        handleSpecialNotesChange,
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

                {modalView === 'edit' ? (
                    <div className="relative flex w-full flex-col items-start justify-start gap-4 sm:gap-6 rounded-lg bg-white p-4 sm:p-6 lg:p-7 shadow-xl font-['Poppins'] max-h-[88dvh] overflow-y-scroll my-auto">
                        <div className="relative flex w-full items-center justify-between">
                            <h3 className="w-full text-center text-lg font-medium text-text px-6">
                                Edit Borrower Details
                            </h3>
                            <XButton
                                onClick={handleCloseEdit}
                                className="absolute right-0 top-0 size-7 flex items-center justify-center"
                            />
                        </div>
                        <EditProfileForm onClose={handleCloseEdit} onUpdated={handleCloseEdit} card />
                    </div>
                ) : null}

                {modalView === 'summary' ? (
                    <SummaryFormView
                        user={user}
                        selectedItems={selectedItems}
                        startDate={startDate}
                        endDate={endDate}
                        minStartDate={minStartDate}
                        hasScheduleConflict={hasScheduleConflict}
                        purpose={purpose}
                        specialNotes={specialNotes}
                        isSubmittable={isSubmittable}
                        isSubmitting={isSubmitting}
                        errorMessage={errorMessage}
                        onClose={onClose}
                        onEdit={handleOpenEdit}
                        onRemoveItem={handleRemoveItem}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        onPurposeChange={handlePurposeChange}
                        onSpecialNotesChange={handleSpecialNotesChange}
                        onSubmit={handleSubmit}
                    />
                ) : null}
            </div>
        </div>
    )
}
