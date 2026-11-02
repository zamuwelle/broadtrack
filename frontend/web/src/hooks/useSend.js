import { useMutation } from '@tanstack/react-query'

export default ({ send, onSuccess, onError }) => {
	const mutation = useMutation({ mutationFn: send, onSuccess, onError })
	return { send: mutation.mutate, isPending: mutation.isPending, error: mutation.error, reset: mutation.reset }
}