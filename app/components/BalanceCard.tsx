import { formatMoney } from '@/utils/format/money'

type Props = {
  title: string
  amount: number
  variant?: 'default' | 'danger' | 'success'
  subtitle?: string
}

export function BalanceCard({ title, amount, variant = 'default', subtitle }: Props) {
  let valueColor = 'text-gray-900'
  if (variant === 'danger') valueColor = 'text-red-600'
  if (variant === 'success') valueColor = 'text-green-600'

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-between">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${valueColor}`}>
        {formatMoney(amount)}
      </div>
      {subtitle && (
        <p className={`text-xs mt-1 ${variant === 'danger' ? 'text-red-500' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
