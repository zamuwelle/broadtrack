import { Link } from 'react-router-dom'
import logo from '@/assets/logo.webp'

export const Logo = ({ link = true }) => {
    const content = (
        <>
            <img
                src={logo}
                alt=""
                width={256}
                height={256}
                className="w-9 h-9 md:w-16 md:h-16 shrink-0 object-contain"
                decoding="sync"
            />
            <p className="text-[17px] md:text-[24px] font-bold tracking-tight">
                <span className="text-primary">Broad</span>
                <span className="text-text">Track</span>
            </p>
        </>
    )

    return link ? (
        <Link to="/" className="flex items-center gap-1.5 md:gap-2">
            {content}
        </Link>
    ) : (
        <div className="flex items-center gap-1.5 md:gap-2">{content}</div>
    )
}
