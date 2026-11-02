import { Logo } from '@/components/ui/Logo'

export const AuthModalHeader = ({ tab }) => (
    <>
        <div className="flex justify-start mb-4">
            <Logo />
        </div>
        {tab === 'login' ? <h3 className="text-[20px] font-bold text-text mb-4">Sign In</h3> : null}
        {tab === 'register' ? <h3 className="text-[20px] font-bold text-text mb-4">Create Account</h3> : null}
        {tab === 'reset' ? <h3 className="text-[20px] font-bold text-text mb-4">Reset Password</h3> : null}
        {tab === 'forgot' ? (
            <div className="mb-4 pr-8">
                <h3 className="text-[20px] font-bold text-text">Forgot Password</h3>
                <p className="text-[13px] text-text/70 mt-0.5">
                    Enter your La Verdad email to receive reset instructions.
                </p>
            </div>
        ) : null}
    </>
)
