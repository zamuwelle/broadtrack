import { isServerError } from '@/lib/errors'
import { useCallback, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from 'cn'
import { contactSchema } from '@shared/schemas/contact'
import { useSetState } from '@shared/hooks/useSetState'
import { useCreateContact } from '@/features/landing/api/create-contact'
import { ContactFormView } from '@/features/landing/components/contact/ContactFormView'

const initialForm = Object.freeze({
    firstname: '',
    lastname: '',
    email: '',
    message: ''
})

const useContactSubmission = (updateContactState) =>
    useCreateContact({
        mutationConfig: {
            onSuccess: () => updateContactState({ sent: true })
        }
    })

export const QuickContact = () => {
    const resetTimer = useRef(null)
    const [contactState, updateContactState] = useSetState({
        isOpen: false,
        sent: false,
        form: initialForm,
        touched: {}
    })
    const { isOpen, sent } = contactState
    const {
        register,
        handleSubmit: submitForm,
        reset: resetForm,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(contactSchema),
        mode: 'onChange',
        defaultValues: initialForm
    })
    const { mutate: send, isPending, error, reset } = useContactSubmission(updateContactState)

    useEffect(() => () => clearTimeout(resetTimer.current), [])

    const handleContactSubmit = useCallback(
        (values) => {
            if (isPending) {
                return
            }
            send({
                firstname: values.firstname.trim(),
                lastname: values.lastname.trim(),
                email: values.email.trim(),
                message: values.message.trim()
            })
        },
        [isPending, send]
    )

    const close = useCallback(() => {
        clearTimeout(resetTimer.current)
        updateContactState({ isOpen: false })
        resetTimer.current = setTimeout(() => {
            updateContactState({ sent: false, form: initialForm, touched: {} })
            resetForm(initialForm)
            reset()
        }, 300)
    }, [reset, resetForm, updateContactState])

    const handleOpen = useCallback(() => {
        clearTimeout(resetTimer.current)
        updateContactState({ isOpen: true })
    }, [updateContactState])

    const handleResetSent = useCallback(() => {
        updateContactState({
            sent: false,
            form: initialForm,
            touched: {}
        })
        resetForm(initialForm)
        reset()
    }, [reset, resetForm, updateContactState])

    return (
        <>
            {isOpen ? (
                <button
                    type="button"
                    aria-label="Close contact backdrop"
                    onClick={close}
                    className="fixed inset-0 z-50 dim-screen transition-opacity border-none outline-none"
                />
            ) : null}
            <div
                className={cn(
                    'fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-300 drop-shadow-2xl',
                    {
                        'translate-x-0': isOpen,
                        'translate-x-[calc(100%-28px)] sm:translate-x-[calc(100%-32px)]': !isOpen
                    }
                )}>
                <button
                    type="button"
                    aria-label={isOpen ? 'Close Contact Panel' : 'Open Contact Panel'}
                    onClick={isOpen ? close : handleOpen}
                    className="w-[28px] sm:w-[32px] h-[120px] sm:h-[160px] flex items-center justify-center bg-primary text-surface text-[12px] sm:text-[14px] font-bold rounded-l-[8px] outline-none shrink-0 cursor-pointer">
                    <span className="-rotate-90 whitespace-nowrap">{isOpen ? 'CLOSE' : 'CONTACT'}</span>
                </button>
                <div
                    inert={!isOpen}
                    className="w-[calc(100vw-36px)] max-w-[448px] max-h-[94dvh] sm:h-[660px] bg-primary rounded-l-[8px] flex flex-col items-center justify-start sm:justify-center p-6 sm:p-8 overflow-y-auto shrink-0">
                    {sent ? (
                        <div className="w-full max-w-[368px] flex flex-col items-center justify-center text-center text-surface py-8 my-auto">
                            <h4 className="text-[22px] font-bold">Message Sent!</h4>
                            <p className="text-[14px] text-surface/80 mt-2 mb-6">Thank you for your feedback.</p>
                            <button
                                type="button"
                                onClick={handleResetSent}
                                className="px-4 py-2 rounded-[8px] border border-white/30 text-surface text-[14px] hover:bg-white/10 transition-colors cursor-pointer">
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <ContactFormView
                            register={register}
                            errors={errors}
                            onSubmit={submitForm(handleContactSubmit)}
                            isValid={isValid}
                            isPending={isPending}
                            error={error && !isServerError(error) ? error : null}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
