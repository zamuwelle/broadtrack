import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from 'cn'
import { OtpInput } from '@/components/ui/OtpInput'
import { submitClass } from '@/features/auth/components/authStyles'
import { useVerifyOtp } from '@/features/auth/components/useVerifyOtp'

export const VerifyOtpForm = ({ email = '', onSwitchTab }) => {
    const {
        otp,
        isComplete,
        countdown,
        error,
        isVerifying,
        isResending,
        isVerified,
        handleOtpChange,
        handleVerify,
        handleResend,
        handleContinueToLogin
    } = useVerifyOtp({ email, onSwitchTab })

    if (isVerified) {
        return (
            <div className="w-full flex flex-col justify-start items-start gap-6 font-['Poppins']">
                <div className="flex flex-col justify-start items-start gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Email Verified!</h3>
                    <p className="text-sm font-normal text-gray-600">
                        Your email has been successfully verified. Your BroadTrack account is now ready.
                    </p>
                </div>

                <div className="w-full">
                    <button
                        type="button"
                        onClick={handleContinueToLogin}
                        className={cn(
                            'w-full hover:opacity-90 cursor-pointer flex items-center justify-center',
                            submitClass
                        )}>
                        Continue to Login
                    </button>
                </div>
            </div>
        )
    }

    const canSubmit = isComplete && !isVerifying

    return (
        <form onSubmit={handleVerify} className="w-full flex flex-col justify-start items-start gap-6 font-['Poppins']">
            <div className="w-full flex flex-col justify-start items-start gap-2">
                <h3 className="text-xl font-bold text-gray-900">Verify Your Email</h3>
                <div className="text-sm font-normal text-gray-600 leading-relaxed">
                    We sent a 6-digit verification code to
                    <br />
                    <span className="font-semibold text-gray-900">{email || 'your email'}</span>
                </div>
            </div>

            <div className="w-full flex flex-col justify-start items-start gap-2">
                <OtpInput
                    value={otp}
                    onChange={handleOtpChange}
                    length={6}
                    isInvalid={Boolean(error)}
                    disabled={isVerifying}
                />

                {error ? (
                    <div className="flex items-center gap-1.5 mt-1 text-red-600">
                        <AlertTriangle className="size-4 shrink-0 text-red-500" />
                        <span className="text-xs font-normal font-['Poppins']">{error}</span>
                    </div>
                ) : null}
            </div>

            <div className="w-full flex flex-col justify-start items-start gap-6">
                <div className="w-full flex items-center gap-1 text-sm">
                    <span className="text-gray-600">Didn&apos;t receive the code?</span>
                    {countdown > 0 ? (
                        <div className="flex items-center gap-1 text-neutral-400 font-semibold">
                            <span>Resend code in</span>
                            <span>{countdown}s</span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50">
                            {isResending ? 'Resending...' : 'Resend code'}
                        </button>
                    )}
                </div>

                <div className="w-full">
                    <button
                        type="submit"
                        disabled={!isComplete || isVerifying}
                        className={cn('w-full flex items-center justify-center gap-2', submitClass, {
                            'hover:opacity-90': canSubmit,
                            'opacity-50 cursor-not-allowed': !canSubmit
                        })}>
                        {isVerifying ? (
                            <>
                                <Loader2 className="size-4 animate-spin shrink-0" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <span>Verify Code</span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
