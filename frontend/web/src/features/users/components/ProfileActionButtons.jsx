import { Button } from '@/components/ui/Button'

const noop = () => null

export const ProfileActionButtons = ({ card = false, canSubmit = false, isPending = false, onClose = noop }) => {
    if (card) {
        return (
            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-text hover:bg-slate-100">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit || isPending}
                    className="h-10 rounded-lg bg-sky-800 px-3 py-2 text-base font-medium text-white hover:bg-sky-900 disabled:opacity-50">
                    Update
                </button>
            </div>
        )
    }

    return (
        <div className="flex gap-3">
            <Button variant="ghost" className="w-20 h-10" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="primary" className="w-20 h-10" type="submit" disabled={!canSubmit || isPending}>
                Update
            </Button>
        </div>
    )
}
