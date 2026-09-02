import { PrivacyPolicy } from '@/features/landing/components/legal/PrivacyPolicy'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

export const PrivacyPage = () => {
    useDocumentTitle('Privacy Policy')
    return <PrivacyPolicy />
}
