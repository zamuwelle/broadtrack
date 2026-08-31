const noop = () => null

export const RegisterFooter = ({ onSwitchLogin = noop }) => (
    <>
        <p className="text-[11px] text-gray-500 text-center mt-2.5">
            By registering, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">
                Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
                Privacy
            </a>
            .
        </p>
        <p className="text-center text-[13px] text-text/70 mt-2.5">
            Already have an account?{' '}
            <button
                type="button"
                onClick={onSwitchLogin}
                className="text-primary font-semibold hover:underline cursor-pointer">
                Sign in
            </button>
        </p>
    </>
)
