import { useCallback, useEffect, useRef } from 'react'
import { cn } from 'cn'

export const OtpInput = ({ value = '', onChange, length = 6, isInvalid = false, disabled = false }) => {
    const containerRef = useRef(null)
    const digits = Array.from({ length }, (_, i) => ({
        id: `otp-box-${i}`,
        index: i,
        char: value[i] || ''
    }))

    useEffect(() => {
        const firstInput = containerRef.current?.querySelector('input[data-index="0"]')
        if (firstInput && !disabled) {
            firstInput.focus()
        }
    }, [disabled])

    const handleInputChange = useCallback(
        (e) => {
            const index = Number(e.currentTarget.dataset.index)
            const raw = e.target.value
            const digit = raw.replaceAll(/\D/gu, '').slice(-1)
            const currentDigits = Array.from({ length }, (_, i) => value[i] || '')

            currentDigits[index] = digit
            const nextValue = currentDigits.join('')
            onChange(nextValue)

            if (digit && index < length - 1) {
                const nextInput = containerRef.current?.querySelector(`input[data-index="${index + 1}"]`)
                if (nextInput) {
                    nextInput.focus()
                }
            }
        },
        [length, onChange, value]
    )

    const handleKeyDown = useCallback(
        (e) => {
            const index = Number(e.currentTarget.dataset.index)
            if (e.key === 'Backspace') {
                const currentDigits = Array.from({ length }, (_, i) => value[i] || '')
                if (!currentDigits[index] && index > 0) {
                    e.preventDefault()
                    currentDigits[index - 1] = ''
                    onChange(currentDigits.join(''))
                    const prevInput = containerRef.current?.querySelector(`input[data-index="${index - 1}"]`)
                    if (prevInput) {
                        prevInput.focus()
                    }
                }
            } else if (e.key === 'ArrowLeft' && index > 0) {
                const prevInput = containerRef.current?.querySelector(`input[data-index="${index - 1}"]`)
                if (prevInput) {
                    prevInput.focus()
                }
            } else if (e.key === 'ArrowRight' && index < length - 1) {
                const nextInput = containerRef.current?.querySelector(`input[data-index="${index + 1}"]`)
                if (nextInput) {
                    nextInput.focus()
                }
            }
        },
        [length, onChange, value]
    )

    const handlePaste = useCallback(
        (e) => {
            e.preventDefault()
            const pastedText = e.clipboardData ? e.clipboardData.getData('text') : ''
            const cleanedDigits = pastedText.replaceAll(/\D/gu, '').slice(0, length)
            if (cleanedDigits) {
                onChange(cleanedDigits)
                const targetIndex = Math.min(cleanedDigits.length, length) - 1
                const safeIndex = Math.max(0, targetIndex)
                const targetInput = containerRef.current?.querySelector(`input[data-index="${safeIndex}"]`)
                if (targetInput) {
                    targetInput.focus()
                }
            }
        },
        [length, onChange]
    )

    return (
        <div ref={containerRef} className="w-full flex items-center justify-between gap-2" onPaste={handlePaste}>
            {digits.map((slot) => (
                <input
                    key={slot.id}
                    data-index={slot.index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete={slot.index === 0 ? 'one-time-code' : 'off'}
                    disabled={disabled}
                    value={slot.char}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-12 h-10 text-center text-sm font-semibold text-black rounded-lg outline outline-1 outline-offset-[-1px] transition-all bg-white font-['Poppins'] disabled:opacity-50 disabled:cursor-not-allowed",
                        {
                            'outline-red-500 bg-red-50/20 text-red-600 focus:outline-red-500': isInvalid,
                            'outline-slate-300 focus:outline-primary focus:outline-2': !isInvalid
                        }
                    )}
                />
            ))}
        </div>
    )
}
