export default ({ title, children }) => (
	<div className="w-full h-[154px] bg-primary p-8 rounded-[8px] flex flex-col justify-center min-w-0">
		<h2 className="text-[32px] font-semibold text-surface leading-none">{title}</h2>
		<p className="text-[14px] text-surface/80">{children}</p>
	</div>
)