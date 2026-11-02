import { useState } from 'react'
import useSend from '@/hooks/useSend'

export default ({ fields, initial, update, onSuccess, onClose }) => {
	const [errors, setErrors] = useState({})
	const [values, setValues] = useState(initial)
	const setError = (key, msg) => setErrors(errors => ({ ...errors, [key]: msg }))
	const set = (key, value) => setValues(values => ({ ...values, [key]: value }))

	const dirty = fields.some(({ key }) => values[key] !== initial[key])
	const valid = dirty && fields.every(({ key, validate }) => !validate || values[key] === initial[key] || !validate(values[key] || ''))

	const { send, isPending } = useSend({
		send: update,
		onSuccess: () => { onSuccess?.(); onClose?.() },
		onError: () => setErrors(errors => ({ ...errors, submit: 'Something went wrong, try again' })),
	})

	return {
		values,
		errors,
		valid,
		isPending,
		set,
		setError,
		handleUpdate: (e) => { e.preventDefault(); if (valid && !isPending) send(buildPayload(fields, values, initial)) },
	}
}

const buildPayload = (fields, values, initial) => Object.fromEntries(fields.filter(({ key }) => values[key] !== initial[key]).map(({ key }) => [key, values[key]]))