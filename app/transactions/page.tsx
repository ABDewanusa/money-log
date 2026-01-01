import { getRecentTransactions } from '@/app/lib/api'
import { deleteTransaction } from '@/app/actions/logTransaction'
import { formatMoney } from '@/utils/format/money'
import Link from 'next/link'

export default async function TransactionsPage() {
  const transactions = await getRecentTransactions()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link 
          href="/dashboard" 
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          &larr; Back
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {tx.description || tx.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500 capitalize">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className={`font-mono font-medium ${
                  tx.type === 'income' ? 'text-green-600' : 
                  tx.type === 'expense' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                  {formatMoney(tx.amount)}
                </div>
                
                <form action={deleteTransaction} className="ml-4">
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <button 
                    type="submit"
                    className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
