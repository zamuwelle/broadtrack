import { useCallback } from 'react'
import {
    MAX_MESSAGE_LENGTH,
    MAX_NAME_LENGTH,
    validateAnyEmail,
    validateMessage,
    validateName
} from '@shared/schemas/common'

const fieldClass =
    'w-full h-[44px] sm:h-[48px] rounded-[8px] bg-placeholder px-4 text-text placeholder:text-[14px] sm:placeholder:text-[15px] text-[14px] sm:text-[15px] outline-none border'
const textareaClass =
    'w-full h-[80px] sm:h-[96px] rounded-[8px] bg-placeholder p-3.5 text-text placeholder:text-[14px] sm:placeholder:text-[15px] text-[14px] sm:text-[15px] outline-none resize-none border'
const sendClass =
    'w-full h-[44px] sm:h-[48px] flex items-center justify-center rounded-[8px] border border-placeholder text-placeholder text-[15px] sm:text-[16px] font-medium hover:bg-white/10 transition-colors'

const inputDefs = Object.freeze([
    {
        name: 'firstname',
        type: 'text',
        maxLength: MAX_NAME_LENGTH,
        placeholder: '* First Name',
        getError: validateName
    },
    {
        name: 'lastname',
        type: 'text',
        maxLength: MAX_NAME_LENGTH,
        placeholder: '* Last Name',
        getError: validateName
    },
    {
        name: 'email',
        type: 'email',
        placeholder: '* Email',
        getError: validateAnyEmail
    }
])

export const ContactFormView = ({ form, touched, onFieldChange, onSubmit, isValid, isPending, error }) => {
    const handleInputChange = useCallback(
        (event) => {
            onFieldChange(event.target.name, event.target.value)
        },
        [onFieldChange]
    )

    const messageError = touched.message ? validateMessage(form.message) : ''

    return (
        <div className="w-full flex flex-col items-center my-auto">
            <h3 className="text-surface text-lg sm:text-[22px] font-bold text-center leading-snug">
                We welcome your questions and
                <br className="hidden sm:inline" /> feedback!
            </h3>
            <div className="h-3 sm:h-5" />
            <form onSubmit={onSubmit} className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-[368px] items-center">
                {inputDefs.map((def) => {
                    const err = touched[def.name] ? def.getError(form[def.name]) : ''
                    return (
                        <div key={def.name} className="w-full">
                            <input
                                name={def.name}
                                type={def.type}
                                maxLength={def.maxLength}
                                value={form[def.name]}
                                onChange={handleInputChange}
                                placeholder={def.placeholder}
                                className={`${fieldClass} ${err ? 'border-red-400' : 'border-transparent'}`}
                            />
                            <div className="h-[14px] sm:h-[16px] flex items-center mt-0.5 px-1">
                                {err ? <span className="text-[11px] sm:text-[12px] text-red-300">{err}</span> : null}
                            </div>
                        </div>
                    )
                })}
                <div className="w-full">
                    <textarea
                        name="message"
                        maxLength={MAX_MESSAGE_LENGTH}
                        value={form.message}
                        onChange={handleInputChange}
                        placeholder="* How can we help you?"
                        className={`${textareaClass} ${messageError ? 'border-red-400' : 'border-transparent'}`}
                    />
                    <div className="h-[14px] sm:h-[16px] flex items-center mt-0.5 px-1">
                        {messageError ? (
                            <span className="text-[11px] sm:text-[12px] text-red-300">{messageError}</span>
                        ) : null}
                    </div>
                </div>
                <div className="h-1" />
                {error ? (
                    <p className="text-[13px] text-red-300 text-center">
                        {error.message || 'Something went wrong, try again.'}
                    </p>
                ) : null}
                <button
                    type="submit"
                    disabled={!isValid || isPending}
                    className={`${sendClass} ${!isValid || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isPending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    )
}
