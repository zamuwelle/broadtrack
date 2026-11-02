import { cn } from 'cn'
import { Button } from '@/components/ui/Button'

export const LandingCta = ({
    onOpenLogin,
    onOpenRegister,
    className = 'flex items-center gap-2',
    buttonClassName = 'w-[144px] h-[48px]',
    loginClassName = ''
}) => (
    <div className={className}>
        <Button onClick={onOpenRegister} className={buttonClassName}>
            Sign Up
        </Button>
        <Button onClick={onOpenLogin} className={cn(buttonClassName, loginClassName)} variant="secondary">
            Login
        </Button>
    </div>
)
