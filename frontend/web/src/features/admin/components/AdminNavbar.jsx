import { useCallback, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ProfileToggle } from '@/features/users/components/ProfileToggle'
import { useUser } from '@/lib/auth'
import { AdminMobileLinkItem } from '@/features/admin/components/AdminMobileLinkItem'

const defaultSidebarLinks = Object.freeze([])
const noop = () => null

export const AdminNavbar = ({ sidebarLinks = defaultSidebarLinks, activeTab = '', onSelectTab = noop }) => {
    const { data: user } = useUser()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleToggleMenu = useCallback(() => {
        setIsMenuOpen((prev) => !prev)
    }, [])

    const handleCloseMenu = useCallback(() => {
        setIsMenuOpen(false)
    }, [])

    const handleSelectTab = useCallback(
        (tabLabel) => {
            onSelectTab(tabLabel)
            setIsMenuOpen(false)
        },
        [onSelectTab]
    )

    return (
        <nav className="w-full h-16 lg:h-20 shrink-0 bg-white shadow-sm relative z-40 font-['Poppins']">
            <div className="w-full px-4 lg:px-[90px] h-full flex items-center justify-between">
                <Logo link={false} />
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
                    <ProfileToggle user={user} onOpen={handleCloseMenu} />
                    {sidebarLinks.length > 0 ? (
                        <div className="flex lg:hidden items-center">
                            <button
                                type="button"
                                aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
                                onClick={handleToggleMenu}
                                className="p-2 rounded-lg text-text hover:bg-slate-100 transition-colors cursor-pointer">
                                {isMenuOpen ? (
                                    <X className="size-6 text-text" />
                                ) : (
                                    <Menu className="size-6 text-text" />
                                )}
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {isMenuOpen ? (
                <>
                    <button
                        type="button"
                        aria-label="Close menu backdrop"
                        className="fixed inset-0 top-16 lg:top-20 bg-black/30 backdrop-blur-xs z-30 lg:hidden cursor-default border-none outline-none"
                        onClick={handleCloseMenu}
                    />
                    <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-6 py-5 flex flex-col gap-2 z-40 lg:hidden">
                        {sidebarLinks.map((item, index) => (
                            <AdminMobileLinkItem
                                key={item.label || `divider-${index}`}
                                item={item}
                                activeTab={activeTab}
                                onSelectTab={handleSelectTab}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </nav>
    )
}
