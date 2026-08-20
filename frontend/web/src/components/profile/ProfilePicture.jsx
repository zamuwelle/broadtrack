import { Icon } from '@/components/ui/Icon'

export const ProfilePicture = ({ picture, onCameraClick }) => (
    <div className="relative w-[110px] h-[112px] flex items-center justify-center">
        <svg viewBox="0 0 110 112" className="w-[110px] h-[112px] -rotate-90">
            <circle
                cx="55"
                cy="56"
                r="52"
                fill="none"
                className="stroke-badge-gold"
                strokeWidth="2"
                pathLength="12"
                strokeDasharray="0.7 0.3"
            />
        </svg>
        {picture ? (
            <img
                src={picture}
                alt=""
                referrerPolicy="no-referrer"
                className="absolute w-[100px] h-[100px] rounded-full object-cover"
            />
        ) : (
            <div className="absolute w-[100px] h-[100px] rounded-full bg-surface-hover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
            <button
                type="button"
                onClick={onCameraClick}
                aria-label="Upload profile picture"
                className="mt-25 w-[50px] h-[50px] rounded-full bg-primary text-white flex items-center justify-center transition-colors hover:bg-badge-blue cursor-pointer">
                <Icon name="camera" />
            </button>
        </div>
    </div>
)
