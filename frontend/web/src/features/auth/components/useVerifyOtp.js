import { useCallback, useEffect, useState } from 'react'
import { verifyEmail } from '@/features/auth/api/verify-email'
import { resendVerification } from '@/features/auth/api/resend-verification'

export const useVerifyOtp = ({ email, onSwitchTab }) => {
    const [otp, setOtp] = useState('')
    const [countdown, setCountdown] = useState(60)
    const [error, setError] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [countdown])

    const handleOtpChange = useCallback((newOtp) => {
        setOtp(newOtp)
        setError('')
    }, [])

    const handleVerify = useCallback(
        async (e) => {
            if (e) {
                e.preventDefault()
            }
            if (otp.length !== 6 || isVerifying) {
                return
            }

            setIsVerifying(true)
            setError('')

            try {
                await verifyEmail({ email, code: otp })
                setIsVerified(true)
            } catch (error_) {
                const message =
                    error_?.response?.data?.message ||
                    error_?.message ||
                    'Incorrect verification code. Please try again.'
                setError(message)
            } finally {
                setIsVerifying(false)
            }
        },
        [email, otp, isVerifying]
    )

    const handleResend = useCallback(async () => {
        if (countdown > 0 || isResending) {
            return
        }

        setIsResending(true)
        setError('')

        try {
            await resendVerification({ email })
            setCountdown(60)
            setOtp('')
        } catch (error_) {
            const message =
                error_?.response?.data?.message || error_?.message || 'Failed to resend code. Please try again later.'
            setError(message)
        } finally {
            setIsResending(false)
        }
    }, [countdown, email, isResending])

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
