import { MAX_NAME_LENGTH } from '@shared/schemas/common'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClassSmall } from '@/features/auth/components/authStyles'

const noop = () => null

export const RegisterNameFields = ({
    firstname = '',
    lastname = '',
    firstnameError = '',
    lastnameError = '',
    onChange = noop
}) => (
    <div className="grid grid-cols-2 gap-2.5">
        <TextInput
            label="First Name"
            name="firstname"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            value={firstname}
            onChange={onChange}
            error={firstnameError}
            className={inputClassSmall}
        />
        <TextInput
            label="Last Name"
            name="lastname"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            value={lastname}
            onChange={onChange}
            error={lastnameError}
            className={inputClassSmall}
        />
    </div>
)
