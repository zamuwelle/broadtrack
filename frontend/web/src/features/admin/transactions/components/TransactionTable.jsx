import { TransactionTableRow } from '@/features/admin/transactions/components/TransactionTableRow'

const defaultTransactions = Object.freeze([])
const noop = () => null

export const TransactionTable = ({ transactions = defaultTransactions, onViewDetails = noop }) => (
    <div className="w-full bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs font-['Poppins']">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 bg-white">
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            TICKET ID
                        </th>
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            BORROWER
                        </th>
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            EQUIPMENT
                        </th>
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            BORROW DATE
                        </th>
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            RETURN DATE
                        </th>
                        <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider">
                            STATUS
                        </th>
                        <th
                            aria-label="Actions"
                            className="px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 text-xs font-semibold text-slate-900 tracking-wider text-right"
                        />
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {transactions.map((booking) => (
                        <TransactionTableRow
                            key={booking.itemKey ?? booking.id}
                            booking={booking}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)
