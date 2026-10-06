const noop = () => null

export const EquipmentFormActions = ({
    isFormValid = false,
    isSubmitting = false,
    isEditMode = false,
    onClose = noop
}) => {
    let submitLabel = isEditMode ? 'Update Equipment' : 'Add Equipment'
    if (isSubmitting) {
        submitLabel = 'Saving...'
    }

    return (
        <div className="flex items-center justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                Cancel
            </button>
            <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="h-9 px-5 rounded-lg bg-sky-800 hover:bg-sky-900 disabled:opacity-50 text-xs font-semibold text-white cursor-pointer transition-colors shadow-sm">
                {submitLabel}
            </button>
        </div>
    )
}
