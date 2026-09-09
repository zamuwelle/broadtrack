import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'

const getBackgroundColor = (type, color) => {
    if (color) {
        return color
    }
    if (type === 'danger') {
        return 'var(--color-danger)'
    }
    if (type === 'warning') {
        return 'var(--color-warning)'
    }
    if (type === 'welcome') {
        return 'var(--color-toast-welcome)'
    }
    return 'var(--color-success)'
}

export const Toast = ({ show, message, color, type = 'success' }) => {
    const [isPresent, setIsPresent] = useState(show)
    const [isVisible, setIsVisible] = useState(false)
    const isWarning = type === 'warning'
    const isDanger = type === 'danger'
    const isAlert = isWarning || isDanger
    const isWelcome =
        type === 'welcome' ||
        color === 'var(--color-toast-welcome)' ||
        color === 'var(--color-border-focus)' ||
        color === '#BBD7EE'
    const backgroundColor = getBackgroundColor(type, color)
    const contentColor = isWelcome ? 'text-primary' : 'text-white'
    const containerStyle = useMemo(() => ({ backgroundColor }), [backgroundColor])

    useEffect(() => {
        let frame
        let timer

        if (show) {
            frame = requestAnimationFrame(() => {
                setIsPresent(true)
                frame = requestAnimationFrame(() => setIsVisible(true))
            })
        } else {
            frame = requestAnimationFrame(() => setIsVisible(false))
            const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
            timer = setTimeout(() => setIsPresent(false), reducedMotion ? 0 : 350)
        }

        return () => {
            cancelAnimationFrame(frame)
            clearTimeout(timer)
        }
    }, [show])

    const handleTransitionEnd = useCallback(
        (event) => {
            if (show) {
                return
            }
            if (event.target === event.currentTarget && event.propertyName === 'opacity') {
                setIsPresent(false)
            }
        },
        [show]
    )

    if (!(show || isPresent)) {
        return null
    }

    return (
        <div
            onTransitionEnd={handleTransitionEnd}
            className={`fixed top-[96px] left-1/2 -translate-x-1/2 z-[60] transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${show && isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div
                className={`flex items-center gap-2.5 shadow-lg ${contentColor} ${isAlert ? 'h-10 px-3 py-2 rounded-md' : 'h-[50px] px-4 rounded-[8px] justify-center'}`}
                style={containerStyle}>
                {isAlert ? (
                    <div className="size-5 flex items-center justify-center shrink-0">
                        <Icon name="warning" className="w-4 h-4 text-white" />
                    </div>
                ) : (
                    <svg
                        className={`w-4 h-4 shrink-0 ${contentColor}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                )}
                <p
                    className={`whitespace-nowrap leading-none font-['Poppins'] ${contentColor} ${isAlert ? 'text-xs font-semibold' : 'text-[12px] font-normal'}`}>
                    {message}
                </p>
            </div>
        </div>
    )
}
