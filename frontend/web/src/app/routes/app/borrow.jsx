import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/lib/authorization'
import { BorrowLayout } from '@/app/routes/app/borrow/borrow-layout'

const borrowerRoles = Object.freeze(['borrower'])

export const BorrowRoute = () => (
    <ProtectedRoute allowedRoles={borrowerRoles}>
        <BorrowLayout>
            <Outlet />
        </BorrowLayout>
    </ProtectedRoute>
)

