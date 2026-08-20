import { Button } from '@/components/ui/Button'

export const LandingCta = ({ onOpenLogin, onOpenRegister }) => (
    <div className="flex items-center gap-2">
        <Button onClick={onOpenRegister} className="w-[144px] h-[48px]">
            Sign Up
        </Button>
        <Button onClick={onOpenLogin} className="w-[144px] h-[48px]" variant="secondary">
            Login
        </Button>
    </div>
)
