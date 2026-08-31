import { CategorySelect } from '@/features/admin/inventory/components/CategorySelect'
import { ErrorText } from '@/components/ui/form/ErrorText'

const defaultCategories = Object.freeze([])
const noop = () => null

export const DetailFields = ({
    categoryId = '',
    categoryError = '',
    categories = defaultCategories,
    isCategoryOpen = false,
    shortDescription = '',
    descriptionError = '',
    technicalSpecs = '',
    onCategoryChange = noop,
    onCategoryToggle = noop,
    onCategoryClose = noop,
    onDescChange = noop,
    onSpecsChange = noop
}) => (
    <>
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">
                Category <span className="text-red-500">*</span>
            </span>
            <CategorySelect
                value={categoryId}
                onChange={onCategoryChange}
                options={categories}
                placeholder="Select a category"
                error={categoryError}
                isOpen={isCategoryOpen}
                onToggle={onCategoryToggle}
                onClose={onCategoryClose}
            />
            <ErrorText message={categoryError} />
        </div>

        <div className="flex flex-col gap-1">
            <label htmlFor="short-desc-input" className="text-xs font-semibold text-slate-800">
                Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
                id="short-desc-input"
                rows={2}
                value={shortDescription}
                onChange={onDescChange}
                placeholder="Brief overview of the equipment item..."
                className={`p-3 rounded-lg border ${descriptionError ? 'border-red-500' : 'border-slate-300'} bg-white text-xs text-slate-900 outline-none focus:border-amber-500 resize-none`}
            />
            <ErrorText message={descriptionError} />
        </div>

        <div className="flex flex-col gap-1">
            <label htmlFor="tech-specs-input" className="text-xs font-semibold text-slate-800">
                Technical Specifications (Optional)
            </label>
            <textarea
                id="tech-specs-input"
                rows={3}
                value={technicalSpecs}
                onChange={onSpecsChange}
                placeholder="One spec per line, e.g.&#10;33MP Full-Frame Sensor&#10;4K 60p Video"
                className="p-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-amber-500 resize-none"
            />
        </div>
    </>
)
