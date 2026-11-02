import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { LandingLinks } from '@/features/landing/components/nav/LandingLinks'

const NavigateHome = () => {
    const navigate = useNavigate()
    useEffect(() => {
        navigate('/')
    }, [navigate])
    return <section id="features" />
}

const initialEntries = ['/privacy']

afterEach(() => vi.unstubAllGlobals())

it('observes landing sections after navigating home from a legal page', async () => {
    const observe = vi.fn()
    let onIntersection
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe = observe
            disconnect = vi.fn()
            constructor(handler) {
                onIntersection = handler
            }
        }
    )

    const view = render(
        <MemoryRouter initialEntries={initialEntries}>
            <LandingLinks />
        </MemoryRouter>
    )
    expect(observe).not.toHaveBeenCalled()

    act(() => {
        view.rerender(
            <MemoryRouter initialEntries={initialEntries}>
                <LandingLinks />
                <NavigateHome />
            </MemoryRouter>
        )
    })
    await waitFor(() => expect(observe).toHaveBeenCalledWith(document.querySelector('#features')))
    act(() => onIntersection([{ isIntersecting: true, target: document.querySelector('#features') }]))
    const link = screen.getByRole('link', { name: 'Features' })
    expect(link).toHaveClass('text-primary')
    expect(link).not.toHaveClass('border-b-2')
})
