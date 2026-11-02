import { useQueryClient } from '@tanstack/react-query'
import useUser from '@/hooks/useUser'
import useUpdateForm from '@/hooks/useUpdateForm'
import { getRequiredError, getPhoneError, getDepartmentError } from '@shared/util/validation'
import { toTitleCase } from '@shared/util/name'
import { authService } from '@/api'
import personIcon from '@/assets/icons/borrower/person.svg'
import emailIcon from '@/assets/icons/borrower/email.svg'
import phoneIcon from '@/assets/icons/borrower/phone.svg'
import departmentIcon from '@/assets/icons/borrower/department.svg'
import Button from '@/components/borrow/Button'
import Select from '@/components/Select'
import { departments } from '@shared/data/departments'

const fields = [
	{ label: 'First Name', icon: personIcon, key: 'firstname', type: 'text', validate: getRequiredError, titleCase: true },
	{ label: 'Last Name', icon: personIcon, key: 'lastname', type: 'text', validate: getRequiredError, titleCase: true },
	{ label: 'Email', icon: emailIcon, key: 'email', type: 'email', readOnly: true },
	{ label: 'Phone', icon: phoneIcon, key: 'phone', type: 'tel', validate: getPhoneError },
	{ label: 'Department', placeholder: 'Select Department', icon: departmentIcon, key: 'department', type: 'text', validate: getDepartmentError },
]

export default ({ onClose, onUpdated }) => {
	const { data: user } = useUser()
	const queryClient = useQueryClient()
	const initial = {
		firstname: toTitleCase(user?.firstname ?? ''),
		lastname: toTitleCase(user?.lastname ?? ''),
		email: user?.email ?? '',
		phone: user?.phone ?? '',
		department: user?.department ?? '',
	}
	const { values, errors, valid, isPending, set, setError, handleUpdate } = useUpdateForm({
		fields,
		initial,
		update: async (changed) => {
			const { data } = await authService.update(changed)
			queryClient.setQueryData(['me'], data)
		},
		onSuccess: onUpdated,
		onClose,
	})

	return (
		<form key={user?.id ?? 'loading'} onSubmit={handleUpdate} className="w-full h-full bg-surface flex flex-col items-center">
			{fields.map(({ label, placeholder, icon, key, type, validate, titleCase, readOnly }) => (
				<div key={label} className="w-[401px] flex flex-col">
					<label className="text-[12px] font-normal text-text">{label}</label>
					{key === 'department' ? (
						<Select
							value={values.department}
							onChange={(value) => { set('department', value); setError('department', '') }}
							options={departments}
							placeholder="Select Department"
							icon={icon}
							wrapperClass="mt-1.5"
							panelClass="bg-gray-100"
							className="w-full h-10 bg-gray-100 border border-[#CFD7E0] px-4 gap-3 text-[12px] text-text"
							hoverClass="hover:bg-[#BABABA]"
							selectedClass="bg-[#BBD7EE]"
						/>
					) : (
						<div className="mt-1.5 w-[401px] h-10 bg-gray-100 border border-[#CFD7E0] rounded-[8px] flex items-center px-4 gap-3 text-text">
							<img src={icon} alt="" />
							<div className="w-px h-6 bg-[#CFD7E0]" />
							<input
								type={type}
								name={key}
								placeholder={placeholder}
								value={titleCase ? toTitleCase(values[key] ?? '') : values[key] ?? ''}
								readOnly={readOnly}
								onBlur={validate && ((e) => setError(key, validate(e.target.value)))}
								onChange={validate ? ((e) => { set(key, e.target.value); setError(key, validate(e.target.value)) }) : ((e) => set(key, e.target.value))}
								className={`flex-1 bg-transparent text-[12px] outline-none placeholder:text-text ${readOnly ? 'text-[#A6A6A6] cursor-not-allowed' : 'text-text'}`}
							/>
						</div>
					)}
					<div className="h-[12px] mt-1 flex items-center leading-none">
						{errors[key] && <span className="text-[12px] leading-none text-red-500">{errors[key]}</span>}
					</div>
				</div>
			))}
			<div className="mt-auto self-end flex flex-col items-end gap-2">
				{errors.submit && <span className="text-[12px] text-red-500">{errors.submit}</span>}
				<div className="flex gap-3">
					<Button onClick={onClose}>Cancel</Button>
					<Button variant="primary" type="submit" disabled={!valid || isPending}>Update</Button>
				</div>
			</div>
		</form>
	)
}