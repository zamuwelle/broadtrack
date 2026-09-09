import { useSend } from '@/hooks/actions/useSend'
import { useSetState } from '@shared/hooks/useSetState'

const noop = () => null

const buildPayload = (fields, values, initialValues) =>
    Object.fromEntries(
        fields.filter(({ key }) => values[key] !== initialValues[key]).map(({ key }) => [key, values[key]])
    )

export const useUpdateForm = ({
    fields = [],
    initialValues = {},
    update,
    onSuccess = noop,
    onClose = noop,
    extraDirty = false
}) => {
    const [formState, updateFormState] = useSetState({
        errors: {},
        values: initialValues
    })
    const { errors, values } = formState
    const setError = (key, message) =>
        updateFormState((prev) => ({
            errors: { ...prev.errors, [key]: message }
        }))
    const setFieldValue = (key, value) =>
        updateFormState((prev) => ({
            values: { ...prev.values, [key]: value }
        }))

    const isDirty = extraDirty || fields.some(({ key }) => values[key] !== initialValues[key])
    const canSubmit = isDirty && fields.every(({ key, validate }) => !validate || !validate(values[key] || ''))

    const { send, isPending } = useSend({
        send: update,
        onSuccess: () => {
            onSuccess()
            onClose()
        },
        onError: (error = {}) => {
            const serverErrors = error.errors ?? {}
            const fieldErrors = Object.fromEntries(
                Object.entries(serverErrors).map(([key, messages]) => [
                    key,
                    Array.isArray(messages) ? messages[0] : messages
                ])
            )
            updateFormState((prev) => ({
                errors: {
                    ...prev.errors,
                    ...fieldErrors,
                    submit: error.message ?? 'Something went wrong, try again'
                }
            }))
        }
    })

    return {
        values,
        errors,
        canSubmit,
        isPending,
        setFieldValue,
        setError,
        handleUpdate: (event) => {
            event.preventDefault()
            if (canSubmit && !isPending) {
                send(buildPayload(fields, values, initialValues))
            }
        }
    }
}
