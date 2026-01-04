import { formatMoney } from '@/utils/format/money'

type Props = {
  title: string
  amount: number
  variant?: 'default' | 'danger' | 'success'
  subtitle?: string
}

export function BalanceCard({ title, amount, variant = 'default', subtitle }: Props) {
  let valueColor = 'text-gray-900 dark:text-gray-100'
  if (variant === 'danger') valueColor = 'text-red-700 dark:text-red-400'
  if (variant === 'success') valueColor = 'text-green-700 dark:text-green-400'

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-w-0">
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium truncate" title={title}>{title}</div>
      <div 
        className={`text-lg sm:text-xl md:text-2xl font-bold mt-1 ${valueColor} truncate`} 
        title={formatMoney(amount)}
      >
        {formatMoney(amount)}
      </div>
      {subtitle && (
        <p className={`text-[10px] sm:text-xs mt-1 ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} truncate`} title={subtitle}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
