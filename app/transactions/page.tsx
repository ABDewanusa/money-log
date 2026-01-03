import { getRecentTransactions } from '@/app/lib/api'
import { deleteTransaction } from '@/app/actions/logTransaction'
import { formatMoney } from '@/utils/format/money'
import Link from 'next/link'

export default async function TransactionsPage() {
  const transactions = await getRecentTransactions()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Transactions</h1>
        <Link 
          href="/transactions/new" 
          className="bg-black text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + New Transaction
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate" title={tx.description || tx.type.replace('_', ' ')}>
                    {tx.description || tx.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className={`font-mono font-medium whitespace-nowrap ${
                    tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 
                    tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                    {formatMoney(tx.amount)}
                  </div>
                  
                  <form action={deleteTransaction}>
                    <input type="hidden" name="transaction_id" value={tx.id} />
                    <button 
                      type="submit"
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-200 dark:border-red-900 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
