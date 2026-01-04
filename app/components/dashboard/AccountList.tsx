import { formatMoney } from '@/utils/format/money'
import { AccountBalance } from '@/app/lib/api'

type Props = {
  accounts: AccountBalance[]
}

export function AccountList({ accounts }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded border border-dashed border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-400 text-center">
        No accounts found.
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200 dark:divide-slate-700">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex flex-col min-w-0 mr-2 sm:mr-4">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base" title={account.name}>{account.name}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {account.type.replace('_', ' ')}
            </span>
          </div>
          <div 
            className={`font-mono font-semibold text-sm sm:text-base whitespace-nowrap ${account.balance < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
            title={formatMoney(account.balance)}
          >
            {formatMoney(account.balance)}
          </div>
        </div>
      ))}
    </div>
  )
}
