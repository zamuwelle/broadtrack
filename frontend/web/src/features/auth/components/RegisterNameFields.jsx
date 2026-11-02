import { MAX_NAME_LENGTH } from '@shared/schemas/common'
import { TextInput } from '@/components/ui/form/TextInput'
import { inputClassSmall } from '@/features/auth/components/authStyles'

const noop = () => null

export const RegisterNameFields = ({
    firstname: _firstname = '',
    lastname: _lastname = '',
    firstnameError = '',
    lastnameError = '',
    register = noop
}) => (
    <div className="grid grid-cols-2 gap-2.5">
        <TextInput
            label="First Name"
            name="firstname"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            {...register('firstname')}
            error={firstnameError}
            className={inputClassSmall}
        />
        <TextInput
            label="Last Name"
            name="lastname"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            {...register('lastname')}
            error={lastnameError}
            className={inputClassSmall}
        />
    </div>
)
