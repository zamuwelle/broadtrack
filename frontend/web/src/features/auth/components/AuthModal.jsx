import { useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { isValidForgotForm, isValidLoginForm, isValidRegisterForm, isValidResetForm } from '@shared/util/validation'
import { useEscapeKey } from '@/hooks/ui/useEscapeKey'
import { useToast } from '@/hooks/ui/useToast'
import { useSetState } from '@shared/hooks/useSetState'
import { useAuthModalActions } from '@/features/auth/components/useAuthModalActions'
import { WelcomeToast } from '@/components/ui/Toast'
import { AuthModalHeader } from '@/features/auth/components/AuthModalHeader'
import { AuthModalBody } from '@/features/auth/components/AuthModalBody'

const initialFormState = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: ''
})

const defaultInitialData = Object.freeze({})
const noop = () => null

const useAuthModalState = ({ mode, initialError, initialData, isOpen, onClose }) => {
    const [authState, updateAuthState] = useSetState({
        tab: mode,
        showPass: false,
        error: initialError,
        successMessage: '',
        form: { ...initialFormState, ...initialData }
    })

    const set = useCallback(
        (key, value) => {
            updateAuthState((prev) => ({
                form: { ...prev.form, [key]: value },
                error: prev.error ? '' : prev.error
            }))
        },
        [updateAuthState]
    )

    const switchTab = useCallback(
        (targetTab) => {
            updateAuthState({
                tab: targetTab,
                showPass: false,
                error: '',
                successMessage: '',
                form: { ...initialFormState }
            })
        },
        [updateAuthState]
    )

    const handleClose = useCallback(() => {
        updateAuthState({
            showPass: false,
            error: '',
            successMessage: '',
            form: { ...initialFormState }
        })
        onClose()
    }, [onClose, updateAuthState])

    const toggleShowPass = useCallback(() => {
        updateAuthState((prev) => ({ showPass: !prev.showPass }))
    }, [updateAuthState])

    useEffect(() => {
        if (isOpen) {
            updateAuthState({
                tab: mode,
                showPass: false,
                error: initialError,
                successMessage: '',
                form: { ...initialFormState, ...initialData }
            })
        }
    }, [isOpen, mode, initialError, initialData, updateAuthState])

    return {
        authState,
        updateAuthState,
        set,
        switchTab,
        handleClose,
        toggleShowPass
    }
}

export const AuthModal = ({
    isOpen = false,
    onClose = noop,
    onLoginSuccess = noop,
    mode = 'login',
    initialError = '',
    initialData = defaultInitialData
}) => {
    const { authState, updateAuthState, set, switchTab, handleClose, toggleShowPass } = useAuthModalState({
        mode,
        initialError,
        initialData,
        isOpen,
        onClose
    })
    const { tab, showPass, error, successMessage, form } = authState
    const { visible: toastVisible, message: toastMessage, type: toastType, show: showToast } = useToast()

    useEscapeKey(onClose)

    useEffect(() => {
        if (isOpen && initialError) {
            showToast(initialError, 'danger')
        }
    }, [isOpen, initialError, showToast])

    const validLogin = isValidLoginForm(form)
    const validRegister = isValidRegisterForm(form)
    const validForgot = isValidForgotForm(form)
    const validReset = isValidResetForm(form)

    const actions = useAuthModalActions({
        form,
        validLogin,
        validRegister,
        validReset,
        onLoginSuccess,
        onClose,
        updateAuthState,
        showToast,
        initialFormState
    })

    if (!isOpen) {
        return null
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-['Poppins']">
                <button
                    type="button"
                    aria-label="Close dialog"
                    tabIndex={-1}
                    className="fixed inset-0 dim-screen border-none outline-none cursor-default"
                    onClick={handleClose}
                />
                <div className="bg-surface p-5 sm:p-6 rounded-[8px] w-full max-w-[420px] max-h-[90dvh] overflow-y-scroll my-auto relative z-10 font-['Poppins']">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-5 right-5 text-text/60 hover:text-text cursor-pointer">
                        <X size={18} />
                    </button>
                    <AuthModalHeader tab={tab} successMessage={successMessage} />
                    <AuthModalBody
                        tab={tab}
                        form={form}
                        error={error}
                        successMessage={successMessage}
                        showPass={showPass}
                        validLogin={validLogin}
                        validRegister={validRegister}
                        validForgot={validForgot}
                        validReset={validReset}
                        actions={actions}
                        onFieldChange={set}
                        onToggleShowPass={toggleShowPass}
                        onSwitchTab={switchTab}
                    />
                </div>
            </div>
            <WelcomeToast show={toastVisible} message={toastMessage} type={toastType} />
        </>
    )
}
