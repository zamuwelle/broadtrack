import { useCallback, useEffect } from 'react'
import { useSetState } from '@shared/hooks/useSetState'
import { verifyEmail } from '@/features/auth/api/verify-email'
import { resendVerification } from '@/features/auth/api/resend-verification'

export const useVerifyOtp = ({ email, onSwitchTab }) => {
    const [state, setState] = useSetState({
        otp: '',
        countdown: 60,
        error: '',
        isVerifying: false,
        isResending: false,
        isVerified: false
    })
    const { otp, countdown, error, isVerifying, isResending, isVerified } = state

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setState((prev) => ({ countdown: prev.countdown > 0 ? prev.countdown - 1 : 0 }))
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [countdown, setState])

    const handleOtpChange = useCallback(
        (newOtp) => {
            setState({ otp: newOtp, error: '' })
        },
        [setState]
    )

    const handleVerify = useCallback(
        async (e) => {
            if (e) {
                e.preventDefault()
            }
            if (otp.length !== 6 || isVerifying) {
                return
            }

            setState({ isVerifying: true, error: '' })

            try {
                await verifyEmail({ email, code: otp })
                setState({ isVerified: true })
            } catch (error_) {
                const message =
                    error_?.response?.data?.message ||
                    error_?.message ||
                    'Incorrect verification code. Please try again.'
                setState({ error: message })
            } finally {
                setState({ isVerifying: false })
            }
        },
        [email, otp, isVerifying, setState]
    )

    const handleResend = useCallback(async () => {
        if (countdown > 0 || isResending) {
            return
        }

        setState({ isResending: true, error: '' })

        try {
            await resendVerification({ email })
            setState({ countdown: 60, otp: '' })
        } catch (error_) {
            const message =
                error_?.response?.data?.message || error_?.message || 'Failed to resend code. Please try again later.'
            setState({ error: message })
        } finally {
            setState({ isResending: false })
        }
    }, [countdown, email, isResending, setState])

    const handleContinueToLogin = useCallback(() => {
        onSwitchTab('login')
    }, [onSwitchTab])

    return {
        otp,
        countdown,
        error,
        isVerifying,
        isResending,
        isVerified,
        handleOtpChange,
        handleVerify,
        handleResend,
        handleContinueToLogin
    }
}
