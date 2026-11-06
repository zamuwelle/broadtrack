import { cn } from 'cn'
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '@shared/schemas/common'
import { ErrorText } from '@/components/ui/form/ErrorText'
import { FormError } from '@/components/ui/form/FormError'

const fieldClass =
    'w-full h-[44px] sm:h-[48px] rounded-[8px] bg-placeholder px-4 text-text placeholder:text-[14px] sm:placeholder:text-[15px] text-[14px] sm:text-[15px] outline-none border'
const textareaClass =
    'w-full h-[80px] sm:h-[96px] rounded-[8px] bg-placeholder p-3.5 text-text placeholder:text-[14px] sm:placeholder:text-[15px] text-[14px] sm:text-[15px] outline-none resize-none border'
const sendClass =
    'w-full h-[44px] sm:h-[48px] flex items-center justify-center rounded-[8px] border border-placeholder text-placeholder text-[15px] sm:text-[16px] font-medium hover:bg-white/10 transition-colors'
const errorClass = 'h-[16px] flex items-center mt-0.5 px-1'
const errorTextClass = 'text-[11px] sm:text-[12px] text-red-300'

const inputDefs = Object.freeze([
    {
        name: 'firstname',
        type: 'text',
        maxLength: MAX_NAME_LENGTH,
        placeholder: '* First Name'
    },
    {
        name: 'lastname',
        type: 'text',
        maxLength: MAX_NAME_LENGTH,
        placeholder: '* Last Name'
    },
    {
        name: 'email',
        type: 'text',
        inputMode: 'email',
        autoComplete: 'email',
        placeholder: '* Email'
    }
])

export const ContactFormView = ({ register, errors, onSubmit, isValid, isPending, error }) => (
    <div className="w-full flex flex-col items-center my-auto">
        <h3 className="text-surface text-lg sm:text-[22px] font-bold text-center leading-snug">
            We welcome your questions and
            <br className="hidden sm:inline" /> feedback!
        </h3>
        <div className="h-3 sm:h-5" />
        <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-[368px] items-center">
            <FormError
                message={error ? error.message || 'Something went wrong, try again.' : ''}
                className="text-red-300 text-center bg-transparent p-0 rounded-none"
            />
            {inputDefs.map((def) => {
                const fieldError = errors[def.name]?.message
                return (
                    <div key={def.name} className="w-full">
                        <input
                            name={def.name}
                            type={def.type}
                            inputMode={def.inputMode}
                            autoComplete={def.autoComplete}
                            maxLength={def.maxLength}
                            {...register(def.name)}
                            placeholder={def.placeholder}
                            className={cn(fieldClass, {
                                'border-red-400': Boolean(fieldError),
                                'border-transparent': !fieldError
                            })}
                        />
                        <ErrorText message={fieldError} className={errorClass} textClassName={errorTextClass} />
                    </div>
                )
            })}
            <div className="w-full">
                <textarea
                    name="message"
                    maxLength={MAX_MESSAGE_LENGTH}
                    {...register('message')}
                    placeholder="* How can we help you?"
                    className={cn(textareaClass, {
                        'border-red-400': Boolean(errors.message),
                        'border-transparent': !errors.message
                    })}
                />
                <ErrorText message={errors.message?.message} className={errorClass} textClassName={errorTextClass} />
            </div>
            <div className="h-1" />
            <button
                type="submit"
                disabled={!isValid || isPending}
                className={cn(sendClass, {
                    'opacity-50 cursor-not-allowed': !isValid || isPending,
                    'cursor-pointer': isValid && !isPending
                })}>
                {isPending ? 'Sending...' : 'Send'}
            </button>
        </form>
    </div>
)
