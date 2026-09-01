import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/lib/authorization'
import { AdminLayout } from '@/app/routes/app/admin/AdminLayout'

const adminRoles = Object.freeze(['admin', 'sysadmin'])

export const AdminRoute = () => (
    <ProtectedRoute allowedRoles={adminRoles}>
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    </ProtectedRoute>
)
