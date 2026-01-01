import { formatMoney } from '@/utils/format/money'
import { AccountBalance } from '@/app/lib/api'

type Props = {
  accounts: AccountBalance[]
}

export function AccountList({ accounts }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded border border-dashed text-gray-500 text-center">
        No accounts found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm"
        >
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{account.name}</span>
            <span className="text-xs text-gray-500 capitalize">
              {account.type.replace('_', ' ')}
            </span>
          </div>
          <div className={`font-mono font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatMoney(account.balance)}
          </div>
        </div>
      ))}
    </div>
  )
}
