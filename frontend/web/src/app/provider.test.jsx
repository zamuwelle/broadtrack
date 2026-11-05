import { useMutation, useQuery } from '@tanstack/react-query'
import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vite-plus/test'
import { AppProvider } from '@/app/provider'
import { useToast } from '@/hooks/ui/useToast'

const serverError = Object.assign(new Error('Server unavailable'), { status: 503 })

afterEach(() => {
    const { result } = renderHook(() => useToast())
    result.current.hide()
})

const FailedPage = ({ error, action = false }) => {
    useQuery({ queryKey: ['failed-page'], queryFn: () => Promise.reject(error), retry: false, enabled: !action })
    const mutation = useMutation({ mutationFn: () => Promise.reject(serverError) })
    const handleSave = mutation.mutate
    return action ? <button type="button" onClick={handleSave}>Save</button> : null
}

it('shows a toast when loading page data fails due to the server', async () => {
    render(
        <AppProvider>
            <FailedPage error={serverError} />
        </AppProvider>
    )
    expect(await screen.findByText('Server unavailable')).toBeTruthy()
})

it('shows a toast when an action fails due to the server', async () => {
    render(<AppProvider><FailedPage error={serverError} action /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Server unavailable')).toBeTruthy()
})
