import { useCallback, useState } from 'react'

export const useSetState = (initialState = {}) => {
    const [state, setState] = useState(initialState)
    const updateState = useCallback((patch) => {
        setState((prev) => ({
            ...prev,
            ...(typeof patch === 'function' ? patch(prev) : patch)
        }))
    }, [])
    return [state, updateState]
}
