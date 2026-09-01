import { ActiveTransactionRow } from '@/features/admin/dashboard/components/ActiveTransactionRow'

const defaultTransactions = Object.freeze([])

export const ActiveTransactionsCard = ({ transactions = defaultTransactions }) => (
    <div className="bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] border border-gray-200 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 font-['Poppins']">
        <div>
            <h2 className="text-xl font-semibold text-gray-900">Active Transaction Status</h2>
            <p className="text-sm font-normal text-gray-500 mt-1">
                Live tracker of broadcast logistics and return timelines.
            </p>
        </div>

        <div className="flex flex-col gap-4">
            {transactions.length > 0 ? (
                transactions.map((booking) => <ActiveTransactionRow key={booking.id} booking={booking} />)
            ) : (
                <div className="text-center py-10 text-sm text-gray-500">No active transactions found.</div>
            )}
        </div>
    </div>
)
