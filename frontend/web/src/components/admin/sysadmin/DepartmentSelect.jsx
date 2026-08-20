import { FormField } from '@/components/ui/form/FormField'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { Select } from '@/components/ui/Select'
import { departments } from '@shared/data/departments'

export const DepartmentSelect = ({ value, onChange, error }) => (
    <FormField label="Department">
        <Select
            value={value}
            onChange={onChange}
            options={departments}
            placeholder="Select Course..."
            error={error}
            panelClass="right-0 left-auto! w-full bg-white shadow-lg"
            hoverClass="hover:bg-gray-100"
            selectedClass="bg-border-focus"
            className="w-full bg-white border border-gray-300 h-10 px-3 gap-2 text-[14px] text-text"
        />
        <ErrorText message={error} />
    </FormField>
)
