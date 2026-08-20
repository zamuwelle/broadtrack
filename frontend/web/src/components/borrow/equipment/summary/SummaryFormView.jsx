import { BorrowerDetailsCard } from '@/components/borrow/equipment/summary/BorrowerDetailsCard'
import { SelectedEquipmentList } from '@/components/borrow/equipment/summary/SelectedEquipmentList'
import { BookingDateInputs } from '@/components/borrow/equipment/summary/BookingDateInputs'
import { XButton } from '@/components/ui/XButton'

export const SummaryFormView = (props) => {
    const {
        user,
        selectedItems,
        startDate,
        endDate,
        minStartDate,
        purpose,
        specialNotes,
        isSubmittable,
        isSubmitting,
        errorMessage,
        onClose,
        onEdit,
        onRemoveItem,
        onStartDateChange,
        onEndDateChange,
        onPurposeChange,
        onSpecialNotesChange,
        onSubmit
    } = props

    return (
        <div className="relative flex w-full flex-col items-start justify-start gap-4 sm:gap-6 rounded-lg bg-white p-4 sm:p-6 lg:p-7 shadow-xl font-['Poppins'] max-h-[88dvh] overflow-y-scroll my-auto">
            <div className="relative flex w-full items-center justify-between">
                <h3 className="w-full text-center text-lg font-medium text-text px-6">Borrow Request Summary</h3>
                <XButton onClick={onClose} className="absolute right-0 top-0 size-7 flex items-center justify-center" />
            </div>

            <BorrowerDetailsCard user={user} onEdit={onEdit} />
            <SelectedEquipmentList selectedItems={selectedItems} onRemove={onRemoveItem} />

            <div className="flex w-full flex-col items-start justify-start gap-3">
                <BookingDateInputs
                    startDate={startDate}
                    endDate={endDate}
                    minStartDate={minStartDate}
                    onStartDateChange={onStartDateChange}
                    onEndDateChange={onEndDateChange}
                />

                <div className="flex w-full flex-col items-start justify-start gap-1.5">
                    <div className="text-xs font-normal text-black font-['Poppins']">
                        Purpose <span className="text-red-500">*</span>
                    </div>
                    <textarea
                        value={purpose}
                        onChange={onPurposeChange}
                        placeholder="Type your purpose here... e.g., Thesis Project"
                        rows={3}
                        className="h-20 w-full resize-none rounded-lg bg-slate-50 p-3 text-xs text-black placeholder:text-neutral-400 outline outline-1 outline-offset-[-1px] outline-slate-300 focus:outline-2 focus:outline-sky-600 font-['Poppins']"
                    />
                </div>
                <div className="flex w-full flex-col items-start justify-start gap-1.5">
                    <div className="text-xs font-normal text-black font-['Poppins']">Special Notes (Optional)</div>
                    <textarea
                        value={specialNotes}
                        onChange={onSpecialNotesChange}
                        placeholder="e.g., Additional cables requested"
                        rows={3}
                        className="h-20 w-full resize-none rounded-lg bg-slate-50 p-3 text-xs text-black placeholder:text-neutral-400 outline outline-1 outline-offset-[-1px] outline-slate-300 focus:outline-2 focus:outline-sky-600 font-['Poppins']"
                    />
                </div>
                {errorMessage ? (
                    <div className="w-full text-xs text-red-500 font-normal font-['Poppins']">{errorMessage}</div>
                ) : null}
            </div>

            <div className="flex w-full items-center justify-end gap-3">
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
                    className={`h-10 rounded-lg px-3 py-2 text-base font-medium transition-colors font-['Poppins'] ${
                        isSubmittable
                            ? 'bg-sky-800 text-white hover:bg-sky-900 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </div>
    )
}
