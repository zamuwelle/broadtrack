import { useCallback } from 'react'
import { contactSchema } from '@shared/schemas/contact'
import { useCreateContact } from '@/api/contact/create-contact'
import { useSetState } from '@shared/hooks/useSetState'
import { ContactSentView } from '@/features/landing/components/contact/ContactSentView'
import { ContactFormView } from '@/features/landing/components/contact/ContactFormView'

const initialForm = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    message: ''
})

export const QuickContact = () => {
    const [contactState, updateContactState] = useSetState({
        isOpen: false,
        sent: false,
        form: initialForm,
        touched: {}
    })
    const { isOpen, sent, form, touched } = contactState
    const {
        mutate: send,
        isPending,
        error,
        reset
    } = useCreateContact({
        mutationConfig: {
            onSuccess: () => updateContactState({ sent: true })
        }
    })

    const isValid = contactSchema.safeParse(form).success

    const updateField = useCallback(
        (name, value) => {
            updateContactState((prev) => ({
                form: { ...prev.form, [name]: value },
                touched: { ...prev.touched, [name]: true }
            }))
        },
        [updateContactState]
    )

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault()
            if (!isValid || isPending) {
                updateContactState({
                    touched: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        message: true
                    }
                })
                return
            }
            send({
                firstname: form.firstname.trim(),
                lastname: form.lastname.trim(),
                email: form.email.trim(),
                message: form.message.trim()
            })
        },
        [form, isPending, isValid, send, updateContactState]
    )

    const close = useCallback(() => {
        updateContactState({ isOpen: false })
        setTimeout(() => {
            updateContactState({ sent: false, form: initialForm, touched: {} })
            reset()
        }, 300)
    }, [reset, updateContactState])

    const handleOpen = useCallback(() => {
        updateContactState({ isOpen: true })
    }, [updateContactState])

    const handleResetSent = useCallback(() => {
        updateContactState({
            sent: false,
            form: initialForm,
            touched: {}
        })
        reset()
    }, [reset, updateContactState])

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close contact backdrop"
                    onClick={close}
                    className="fixed inset-0 z-50 dim-screen transition-opacity border-none outline-none"
                />
            )}
            <div
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-300 drop-shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-28px)] sm:translate-x-[calc(100%-32px)]'}`}>
                <button
                    type="button"
                    aria-label={isOpen ? 'Close Contact Panel' : 'Open Contact Panel'}
                    onClick={isOpen ? close : handleOpen}
                    className="w-[28px] sm:w-[32px] h-[120px] sm:h-[160px] flex items-center justify-center bg-primary text-surface text-[12px] sm:text-[14px] font-bold rounded-l-[8px] outline-none shrink-0 cursor-pointer">
                    <span className="-rotate-90 whitespace-nowrap">{isOpen ? 'CLOSE' : 'CONTACT'}</span>
                </button>
                <div className="w-[calc(100vw-36px)] max-w-[448px] max-h-[94dvh] sm:h-[660px] bg-primary rounded-l-[8px] flex flex-col items-center justify-start sm:justify-center p-6 sm:p-8 overflow-y-auto shrink-0">
                    {sent ? (
                        <ContactSentView onReset={handleResetSent} />
                    ) : (
                        <ContactFormView
                            form={form}
                            touched={touched}
                            onFieldChange={updateField}
                            onSubmit={handleSubmit}
                            isValid={isValid}
                            isPending={isPending}
                            error={error}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
