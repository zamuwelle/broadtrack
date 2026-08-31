import { Navigate } from 'react-router-dom'
import { paths } from '@/config/paths'

export const AdminIndexRoute = () => <Navigate to={paths.app.adminDashboard} replace />
