export const ContactSentView = ({ onReset }) => (
    <div className="w-full max-w-[368px] flex flex-col items-center justify-center text-center text-surface py-8 my-auto">
        <h4 className="text-[22px] font-bold">Message Sent!</h4>
        <p className="text-[14px] text-surface/80 mt-2 mb-6">Thank you for your feedback.</p>
        <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-[8px] border border-white/30 text-surface text-[14px] hover:bg-white/10 transition-colors cursor-pointer">
            Send another message
        </button>
    </div>
)
