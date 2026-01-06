import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getMonthlyStats, getYearlyStats } from '@/app/lib/api'
import { formatMoney } from '@/utils/format/money'

export default async function ReportsPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-indexed

  const selectedYear = searchParams.year ? parseInt(searchParams.year) : currentYear
  const selectedMonth = searchParams.month ? parseInt(searchParams.month) : currentMonth

  const [monthlyStats, yearlyStats] = await Promise.all([
    getMonthlyStats(selectedYear, selectedMonth),
    getYearlyStats(selectedYear)
  ])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Helper to generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index,
    label: name
  }))

  // Helper to generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => ({
    value: year,
    label: year.toString()
  }))

  return (
    <div className="space-y-8 pb-20">
      <h1 className="text-2xl font-bold dark:text-white">Reports</h1>

      {/* Filters */}
      <form className="flex gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
          <select 
            name="month" 
            id="month" 
            defaultValue={selectedMonth}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
          <select 
            name="year" 
            id="year" 
            defaultValue={selectedYear}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
          >
            {yearOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Filter
        </button>
      </form>

      {/* Monthly Summary Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">
          {monthNames[selectedMonth]} {selectedYear} Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{formatMoney(monthlyStats.total_income)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">{formatMoney(monthlyStats.total_expenses)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Savings</h3>
            <p className={`text-2xl font-bold mt-2 ${monthlyStats.net_savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(monthlyStats.net_savings)}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Spending Breakdown */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold dark:text-white">Monthly Spending Breakdown</h3>
        
        {monthlyStats.expenses_by_type.length === 0 ? (
          <p className="text-gray-500">No expenses recorded for this period.</p>
        ) : (
          <div className="space-y-8">
            {monthlyStats.expenses_by_type.map((typeItem) => {
              const typePercentage = monthlyStats.total_expenses > 0 
                ? (typeItem.amount / monthlyStats.total_expenses) * 100 
                : 0
              
              const typeLabels: Record<string, string> = {
                need: 'Needs',
                want: 'Wants',
                savings: 'Savings',
                uncategorized: 'Uncategorized'
              }
              
              const typeColors: Record<string, string> = {
                need: 'bg-blue-600',
                want: 'bg-purple-600',
                savings: 'bg-green-600',
                uncategorized: 'bg-gray-400'
              }

              // Filter categories for this type
              const typeGroups = monthlyStats.expenses_by_category.filter(g => g.type === typeItem.type)

              return (
                <div key={typeItem.type} className="space-y-3">
                  {/* Philosophy Header */}
                  <div>
                    <div className="flex justify-between text-base font-medium mb-1 dark:text-white">
                      <span className="capitalize">{typeLabels[typeItem.type] || typeItem.type}</span>
                      <span>{formatMoney(typeItem.amount)} ({typePercentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className={`${typeColors[typeItem.type] || 'bg-blue-600'} h-2.5 rounded-full`} 
                        style={{ width: `${typePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Groups Breakdown */}
                  {typeGroups.length > 0 && (
                    <div className="pl-4 space-y-2 border-l-2 border-gray-100 dark:border-gray-700">
                      {typeGroups.map(group => {
                        // Percentage relative to the TOTAL expenses (consistent with global view)
                        // Or should it be relative to the philosophy total? 
                        // Let's stick to global total for consistency, or maybe show both?
                        // Let's show global percentage to keep it simple and consistent with previous view.
                        const groupPercentage = monthlyStats.total_expenses > 0
                          ? (group.amount / monthlyStats.total_expenses) * 100
                          : 0
                        
                        return (
                          <div key={group.category_id}>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>{group.category_name}</span>
                              <span>{formatMoney(group.amount)} ({groupPercentage.toFixed(1)}%)</span>
                            </div>
                            {/* Optional: mini bar for group */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
                              <div 
                                className={`${typeColors[typeItem.type] || 'bg-blue-600'} h-1.5 rounded-full opacity-60`} 
                                style={{ width: `${groupPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Yearly Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-white">{selectedYear} Yearly Trends</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses ({selectedYear})</h3>
            <p className="text-2xl font-bold dark:text-white mt-2">{formatMoney(yearlyStats.total_expenses)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Monthly Spending</h3>
            <p className="text-2xl font-bold dark:text-white mt-2">{formatMoney(yearlyStats.average_monthly_expenses)}</p>
          </div>
        </div>

        {/* Yearly Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-x-auto">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">Monthly Breakdown</h3>
          
          <div className="flex items-end space-x-4 h-64 min-w-[600px]">
            {yearlyStats.monthly_breakdown.map((monthData, index) => {
              // Calculate max value for scaling (use whichever is higher: income or expense) to prevent overflow
              const maxValue = Math.max(
                ...yearlyStats.monthly_breakdown.map(m => Math.max(m.income, m.expenses))
              ) || 1

              const incomeHeight = (monthData.income / maxValue) * 100
              const expenseHeight = (monthData.expenses / maxValue) * 100

              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div className="flex space-x-1 items-end h-full w-full justify-center">
                    {/* Income Bar */}
                    <div 
                      className="w-3 bg-green-400 rounded-t hover:bg-green-500 transition-all relative"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Income: ${formatMoney(monthData.income)}`}
                    ></div>
                    {/* Expense Bar */}
                    <div 
                      className="w-3 bg-red-400 rounded-t hover:bg-red-500 transition-all relative"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Expenses: ${formatMoney(monthData.expenses)}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 dark:text-gray-400">{monthNames[index].substring(0, 3)}</span>
                  
                  {/* Tooltip for exact amounts */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-black text-white text-xs rounded p-2 whitespace-nowrap">
                    <div>In: {formatMoney(monthData.income)}</div>
                    <div>Out: {formatMoney(monthData.expenses)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
