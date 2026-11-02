import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { useBorrowSummaryLogic } from '@/features/borrow/request/useBorrowSummaryLogic'
import { useBookingCartStore } from '@/features/borrow/stores/useBookingCartStore'

const { submitBooking } = vi.hoisted(() => ({ submitBooking: vi.fn() }))
vi.mock('@/lib/auth', () => ({ useUser: () => ({ data: { id: 1 } }) }))
vi.mock('@/features/bookings/api/get-bookings', () => ({
    useBookings: () => ({ data: [] })
}))
vi.mock('@/features/bookings/api/create-booking', () => ({
    useCreateBooking: () => ({ mutateAsync: submitBooking })
}))
vi.mock('@/hooks/ui/useToast', () => ({ useToast: () => ({ show: vi.fn() }) }))

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T10:00:00+08:00'))
    submitBooking.mockReset()
    useBookingCartStore.setState({
        items: [{ id: 42, name: 'Camera', status: 'available' }]
    })
})

afterEach(() => {
    useBookingCartStore.setState({ items: [] })
    vi.useRealTimers()
})

it('clears a request failure when the summary closes', async () => {
    submitBooking.mockRejectedValueOnce(new Error('Network Error'))
    const { result, rerender } = renderHook(({ isOpen }) => useBorrowSummaryLogic({ isOpen }), {
        initialProps: { isOpen: true }
    })
    act(() => result.current.handlePurposeChange({ target: { value: 'Testing' } }))
    await act(() => result.current.handleSubmit())
    expect(result.current.requestError).toBe('Network Error')
    rerender({ isOpen: false })
    rerender({ isOpen: true })
    expect(result.current.requestError).toBe('')
})

it('ignores a late form error after the summary is reopened', async () => {
    let rejectRequest
    submitBooking.mockImplementationOnce(
        () =>
            new Promise((resolve, reject) => {
                rejectRequest = reject
            })
    )
    const { result, rerender } = renderHook(({ isOpen }) => useBorrowSummaryLogic({ isOpen }), {
        initialProps: { isOpen: true }
    })
    act(() => result.current.handlePurposeChange({ target: { value: 'Testing' } }))
    let submission
    act(() => {
        submission = result.current.handleSubmit()
    })
    rerender({ isOpen: false })
    rerender({ isOpen: true })
    await act(async () => {
        rejectRequest(new Error('Late failure'))
        await submission
    })
    expect(result.current.requestError).toBe('')
})

it('keeps newly selected equipment when an earlier request succeeds', async () => {
    let finishRequest
    submitBooking.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finishRequest = resolve
            })
    )
    const { result, rerender } = renderHook(({ isOpen }) => useBorrowSummaryLogic({ isOpen }), {
        initialProps: { isOpen: true }
    })
    act(() => result.current.handlePurposeChange({ target: { value: 'Testing' } }))
    let submission
    act(() => {
        submission = result.current.handleSubmit()
    })
    rerender({ isOpen: false })
    act(() => useBookingCartStore.getState().toggleItem({ id: 43, name: 'New item', status: 'available' }))
    rerender({ isOpen: true })
    await act(async () => {
        finishRequest({})
        await submission
    })
    expect(useBookingCartStore.getState().items.map((item) => item.id)).toEqual([43])
    expect(result.current.modalView).toBe('summary')
})

it('keeps the same equipment if it was removed and selected again while submitting', async () => {
    let finishRequest
    submitBooking.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finishRequest = resolve
            })
    )
    const { result, rerender } = renderHook(({ isOpen }) => useBorrowSummaryLogic({ isOpen }), {
        initialProps: { isOpen: true }
    })
    act(() => result.current.handlePurposeChange({ target: { value: 'Testing' } }))
    let submission
    act(() => {
        submission = result.current.handleSubmit()
    })
    rerender({ isOpen: false })
    act(() => {
        const equipment = useBookingCartStore.getState().items[0]
        useBookingCartStore.getState().toggleItem(equipment)
        useBookingCartStore.getState().toggleItem(equipment)
    })
    await act(async () => {
        finishRequest({})
        await submission
    })
    expect(useBookingCartStore.getState().items.map((item) => item.id)).toEqual([42])
})
