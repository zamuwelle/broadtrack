import { Navigate } from 'react-router-dom'
import { paths } from '@/config/paths'

export const Component = () => <Navigate to={paths.home} replace />
