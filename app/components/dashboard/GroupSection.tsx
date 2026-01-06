import { formatMoney } from '@/utils/format/money'
import { isSystemBudget } from '@/utils/budgets'
import { BudgetBalance, Category } from '@/app/lib/api'

type Props = {
  group: Category & { budgets: BudgetBalance[] }
}

export function GroupSection({ group }: Props) {
  const targetLabel = group.title === 'Savings' ? 'Goal' : 'Budget'

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end border-b pb-1 border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{group.title}</h3>
      </div>

      {group.budgets.length === 0 ? (
        <p className="text-sm text-gray-400 italic pl-2">No budgets</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200 dark:divide-slate-700">
          {group.budgets.map((budget, index) => (
            <div
              key={`${budget.id}-${index}`}
              className="flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex flex-col min-w-0 mr-2 sm:mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate text-sm sm:text-base" title={budget.name}>
                    {budget.name}
                  </span>
                  {isSystemBudget(budget.name) && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold flex-shrink-0">
                      System
                    </span>
                  )}
                </div>
                {budget.target_amount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={`Goal: ${formatMoney(budget.target_amount)}`}>
                    Goal: {formatMoney(budget.target_amount)}
                  </span>
                )}
              </div>
              
              <div 
                className={`font-mono font-medium text-sm sm:text-base whitespace-nowrap ${budget.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
                title={formatMoney(budget.balance)}
              >
                {formatMoney(budget.balance)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
