import { TermsOfService } from '@/features/landing/components/legal/TermsOfService'
import { useDocumentTitle } from '@/hooks/ui/useDocumentTitle'

export const TermsPage = () => {
    useDocumentTitle('Terms of Service')
    return <TermsOfService />
}
