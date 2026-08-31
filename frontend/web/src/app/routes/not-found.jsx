import { Navigate } from 'react-router-dom'
import { paths } from '@/config/paths'

export const NotFoundRoute = () => <Navigate to={paths.home} replace />
