import CameraButton from './CameraButton'

export default ({ onCameraClick }) => (
	<div className="relative w-[110px] h-[112px] flex items-center justify-center">
		<svg viewBox="0 0 110 112" className="w-[110px] h-[112px] -rotate-90">
			<circle cx="55" cy="56" r="52" fill="none" stroke="#BA7D16" strokeWidth="2"
				pathLength="12" strokeDasharray="0.7 0.3" />
		</svg>
		<div className="absolute w-[100px] h-[100px] rounded-full bg-[#EDF0F4]" />
		<div className="absolute inset-0 flex items-center justify-center">
			<CameraButton onClick={onCameraClick} />
		</div>
	</div>
)
