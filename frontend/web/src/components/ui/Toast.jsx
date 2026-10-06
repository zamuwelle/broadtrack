import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from 'cn'
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
    const contentColor = cn({ 'text-primary': isWelcome, 'text-white': !isWelcome })
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
            className={cn(
                'fixed top-[96px] left-1/2 -translate-x-1/2 z-[60] w-max max-w-[calc(100vw-2rem)] transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                {
                    'opacity-100 translate-y-0 pointer-events-auto': show && isVisible,
                    'opacity-0 -translate-y-4 pointer-events-none': !(show && isVisible)
                }
            )}>
            <div
                className={cn('flex items-center gap-2.5 shadow-lg', contentColor, {
                    'min-h-10 px-3 py-2 rounded-md': isAlert,
                    'min-h-[50px] px-4 py-2 rounded-[8px] justify-center': !isAlert
                })}
                style={containerStyle}>
                {isAlert ? (
                    <div className="size-5 flex items-center justify-center shrink-0">
                        <Icon name="warning" className="w-4 h-4 text-white" />
                    </div>
                ) : (
                    <svg
                        className={cn('w-4 h-4 shrink-0', contentColor)}
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
                    className={cn("min-w-0 whitespace-normal [overflow-wrap:anywhere] leading-4 font-['Poppins']", contentColor, {
                        'text-xs font-semibold': isAlert,
                        'text-[12px] font-normal': !isAlert
                    })}>
                    {message}
                </p>
            </div>
        </div>
    )
}
