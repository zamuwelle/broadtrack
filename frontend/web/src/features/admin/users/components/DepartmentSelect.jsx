import { FormField } from '@/components/ui/form/FormField'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { Select } from '@/components/ui/Select'
import { DEPARTMENTS } from '@shared/constants'

export const DepartmentSelect = ({ value, onChange, error }) => (
    <FormField label="Department">
        <Select
            value={value}
            onChange={onChange}
            options={DEPARTMENTS}
            placeholder="Select Course..."
            error={error}
            wrapperClass="max-sm:[&>button]:h-auto max-sm:[&>button]:min-h-10 max-sm:[&>button]:py-2 max-sm:[&>button>span:first-child]:whitespace-normal max-sm:[&>button>span:first-child]:overflow-visible max-sm:[&>button>svg]:shrink-0"
            panelClass="right-0 left-auto! w-full bg-white shadow-lg max-sm:[&>button]:h-auto max-sm:[&>button]:min-h-10 max-sm:[&>button]:whitespace-normal max-sm:[&>button]:py-2"
            hoverClass="hover:bg-gray-100"
            selectedClass="bg-border-focus"
            className="w-full bg-white border border-gray-300 h-10 px-3 gap-2 text-[14px] text-text"
        />
        <ErrorText message={error} />
    </FormField>
)
