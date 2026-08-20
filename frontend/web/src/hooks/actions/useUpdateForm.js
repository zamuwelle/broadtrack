import { useSend } from '@/hooks/actions/useSend'
import { useSetState } from '@shared/hooks/useSetState'

const noop = () => null

const buildPayload = (fields, values, initial) =>
    Object.fromEntries(fields.filter(({ key }) => values[key] !== initial[key]).map(({ key }) => [key, values[key]]))

export const useUpdateForm = ({
    fields = [],
    initial = {},
    update,
    onSuccess = noop,
    onClose = noop,
    extraDirty = false
}) => {
    const [formState, updateFormState] = useSetState({
        errors: {},
        values: initial
    })
    const { errors, values } = formState
    const setError = (key, message) =>
        updateFormState((prev) => ({
            errors: { ...prev.errors, [key]: message }
        }))
    const set = (key, value) =>
        updateFormState((prev) => ({
            values: { ...prev.values, [key]: value }
        }))

    const dirty = extraDirty || fields.some(({ key }) => values[key] !== initial[key])
    const valid = dirty && fields.every(({ key, validate }) => !validate || !validate(values[key] || ''))

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
        valid,
        isPending,
        set,
        setError,
        handleUpdate: (event) => {
            event.preventDefault()
            if (valid && !isPending) {
                send(buildPayload(fields, values, initial))
            }
        }
    }
}
