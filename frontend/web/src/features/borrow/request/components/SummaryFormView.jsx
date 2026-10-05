import { cn } from 'cn'
import { MAX_BOOKING_PURPOSE_LENGTH } from '@shared/schemas/booking'
import { SelectedEquipmentList } from '@/features/borrow/request/components/SelectedEquipmentList'
import { BookingDateInputs } from '@/features/borrow/request/components/BookingDateInputs'
import { XButton } from '@/components/ui/XButton'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { FormError } from '@/components/ui/form/FormError'

const getDateMessage = ({ hasConflict, conflicts, error, helper }) =>
    hasConflict && conflicts.length > 0 ? '' : error || helper

export const SummaryFormView = (props) => {
    const {
        user,
        selectedItems,
        startDate,
        endDate,
        minStartDate,
        excludeDateIntervals,
        hasStartConflict,
        hasEndConflict,
        hasScheduleConflict,
        conflictMessages,
        purpose,
        isSubmittable,
        isSubmitting,
        errorMessage,
        requestError,
        helperMessage = '',
        onClose,
        onRemoveItem,
        onStartDateChange,
        onEndDateChange,
        onPurposeChange,
        onSubmit
    } = props

    return (
        <div className="relative flex w-full flex-col items-start justify-start gap-4 sm:gap-6 rounded-lg bg-white p-4 sm:p-6 lg:p-7 shadow-xl font-['Poppins'] max-h-[88dvh] overflow-y-scroll my-auto">
            <div className="relative flex w-full items-center justify-between">
                <h3 className="w-full text-center text-lg font-medium text-text px-6">Borrow Request Summary</h3>
                <XButton onClick={onClose} className="absolute right-0 top-0 size-7 flex items-center justify-center" />
            </div>

            <FormError message={requestError} className="w-full" />

            <div className="flex w-full flex-col items-end justify-start gap-3 rounded-lg bg-zinc-100/40 p-4 outline outline-1 outline-offset-[-1px] outline-slate-300">
                <div className="w-full">
                    <span className="text-xs font-normal text-neutral-400">BORROWER DETAILS</span>
                </div>
                <div className="flex w-full flex-col items-start justify-start gap-1 text-xs font-normal text-text">
                    <div>Name: {user?.full_name || user?.name || 'User Name'}</div>
                    <div>Email: {user?.email || 'user.email@student.laverdad.edu.ph'}</div>
                    <div>Department: {user?.department || 'BS Information Systems'}</div>
                </div>
            </div>
            <SelectedEquipmentList selectedItems={selectedItems} onRemove={onRemoveItem} />

            <div className="flex w-full flex-col items-start justify-start gap-3">
                <div className="w-full">
                    <BookingDateInputs
                        startDate={startDate}
                        endDate={endDate}
                        minStartDate={minStartDate}
                        excludeDateIntervals={excludeDateIntervals}
                        hasStartConflict={hasStartConflict}
                        hasEndConflict={hasEndConflict}
                        hasScheduleConflict={hasScheduleConflict}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                    />
                    <ErrorText
                        message={getDateMessage({
                            hasConflict: hasScheduleConflict,
                            conflicts: conflictMessages,
                            error: errorMessage,
                            helper: helperMessage
                        })}
                        variant={errorMessage ? 'error' : 'muted'}
                        className="min-h-4 flex items-center mt-1"
                    />
                    {conflictMessages.map((message) => (
                        <ErrorText key={message} message={message} className="min-h-4 flex items-start mt-1" />
                    ))}
                </div>

                <div className="flex w-full flex-col items-start justify-start gap-1.5">
                    <div className="text-xs font-normal text-black font-['Poppins']">
                        Purpose / Notes <span className="text-red-500">*</span>
                    </div>
                    <textarea
                        value={purpose}
                        onChange={onPurposeChange}
                        placeholder="Type your purpose or notes here... e.g., Thesis Project"
                        maxLength={MAX_BOOKING_PURPOSE_LENGTH}
                        rows={3}
                        className="h-20 w-full resize-none rounded-lg bg-slate-50 p-3 text-xs text-black placeholder:text-neutral-400 outline outline-1 outline-offset-[-1px] outline-slate-300 focus:outline-2 focus:outline-sky-600 font-['Poppins']"
                    />
                </div>
            </div>

            <div className="mt-2 sm:mt-0 flex w-full items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 w-20 rounded-lg bg-slate-50 px-3 py-2 text-base font-medium text-black hover:bg-slate-100 font-['Poppins'] cursor-pointer">
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={!isSubmittable}
                    onClick={onSubmit}
                    className={cn(
                        "h-10 rounded-lg px-3 py-2 text-base font-medium transition-colors font-['Poppins']",
                        {
                            'bg-sky-800 text-white hover:bg-sky-900 cursor-pointer': isSubmittable,
                            'bg-slate-200 text-slate-400 cursor-not-allowed': !isSubmittable
                        }
                    )}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </div>
    )
}
