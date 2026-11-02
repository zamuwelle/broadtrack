import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useToast } from '@/hooks/ui/useToast'

describe('useToast', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        act(() => {
            vi.runOnlyPendingTimers()
        })
        vi.useRealTimers()
    })

    it('shares toast state across multiple hook instances and immediately replaces active toast', () => {
        const { result: hookA } = renderHook(() => useToast())
        const { result: hookB } = renderHook(() => useToast())

        act(() => {
            hookA.current.show('Welcome back, Sam!', 'welcome')
        })

        expect(hookA.current.message).toBe('Welcome back, Sam!')
        expect(hookA.current.type).toBe('welcome')
        expect(hookA.current.visible).toBe(true)
        expect(hookB.current.message).toBe('Welcome back, Sam!')
        expect(hookB.current.type).toBe('welcome')
        expect(hookB.current.visible).toBe(true)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        act(() => {
            hookB.current.show('Cannot delete user.', 'danger')
        })

        expect(hookA.current.message).toBe('Cannot delete user.')
        expect(hookA.current.type).toBe('danger')
        expect(hookA.current.visible).toBe(true)
        expect(hookB.current.message).toBe('Cannot delete user.')
        expect(hookB.current.type).toBe('danger')
        expect(hookB.current.visible).toBe(true)
    })

    it('resets the auto-hide timer when a second toast replaces the first toast at t = 2000ms', () => {
        const { result: hookA } = renderHook(() => useToast())
        const { result: hookB } = renderHook(() => useToast())

        act(() => {
            hookA.current.show('Welcome back, Sam!', 'welcome')
        })

        expect(hookA.current.visible).toBe(true)

        act(() => {
            vi.advanceTimersByTime(2000)
        })

        act(() => {
            hookB.current.show('Cannot delete user.', 'danger')
        })

        // At t = 3500ms (1500ms after second show), visible remains true because old timer was cleared
        act(() => {
            vi.advanceTimersByTime(1500)
        })

        expect(hookA.current.visible).toBe(true)
        expect(hookB.current.visible).toBe(true)

        // At t = 5000ms (another 1500ms, 3000ms after second show), visible becomes false
        act(() => {
            vi.advanceTimersByTime(1500)
        })

        expect(hookA.current.visible).toBe(false)
        expect(hookB.current.visible).toBe(false)
    })

    it('immediately hides the toast and clears the active timer when hide() is called', () => {
        const { result } = renderHook(() => useToast())

        act(() => {
            result.current.show('Action successful', 'success')
        })

        expect(result.current.visible).toBe(true)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        act(() => {
            result.current.hide()
        })

        expect(result.current.visible).toBe(false)

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        expect(result.current.visible).toBe(false)
    })
})
