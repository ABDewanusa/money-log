import { getRecentTransactions } from '@/app/lib/api'
import { deleteTransaction } from '@/app/actions/logTransaction'
import { formatMoney } from '@/utils/format/money'
import Link from 'next/link'

export default async function TransactionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const filter = (typeof searchParams.filter === 'string' ? searchParams.filter : 'all')
  const transactions = await getRecentTransactions(50, filter === 'all' ? undefined : filter)

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
    { id: 'transfer', label: 'Transfers' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Transactions</h1>
        <Link 
          href="/transactions/new" 
          className="bg-black text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + New Transaction
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
        <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={tab.id === 'all' ? '/transactions' : `/transactions?filter=${tab.id}`}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
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
