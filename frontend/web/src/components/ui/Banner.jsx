export const Banner = ({ title, children, className = '' }) => (
    <div
        className={`w-full min-h-[130px] lg:h-[154px] bg-primary p-5 lg:p-8 rounded-[8px] flex flex-col justify-center gap-2.5 min-w-0 ${className}`}>
        <h2 className="text-2xl lg:text-[32px] font-semibold text-surface leading-none">{title}</h2>
        <p className="text-[14px] text-surface/80">{children}</p>
    </div>
)
