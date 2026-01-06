import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAccountBalances, getBudgetBalances, getCategories, getRecentTransactions } from '@/app/lib/api'
import { formatMoney } from '@/utils/format/money'
import { BalanceCard } from '@/app/components/dashboard/BalanceCard'
import { GroupSection } from '@/app/components/dashboard/GroupSection'
import { AccountList } from '@/app/components/dashboard/AccountList'

import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch all data in parallel
  const [groups, budgetBalances, accountBalances, recentTransactions] = await Promise.all([
    getCategories(),
    getBudgetBalances(),
    getAccountBalances(),
    getRecentTransactions(5)
  ])

  // Calculate summary from balances
  const total_cash = accountBalances.reduce((sum, acc) => sum + acc.balance, 0)
  const total_budgeted = budgetBalances.reduce((sum, budget) => sum + budget.balance, 0)
  const summary = {
    total_cash,
    total_budgeted
  }

  // 2. Combine groups with their budgets
  const groupsWithBudgets = groups.map(group => ({
    ...group,
    budgets: budgetBalances.filter(b => b.category_id === group.id)
  }))

  // 3. Identify "To Be Budgeted" budget (System)
  const tbbBudget = budgetBalances.find(b => b.name === 'To Be Budgeted')
  const tbbAmount = tbbBudget ? tbbBudget.balance : 0

  // 4. Group Budgets by Philosophy Type (Need, Want, Savings)
  
  // Create a map of Group ID -> Group Type
  const groupTypeMap = new Map<string, string>()
  groups.forEach(g => {
    if (g.type) groupTypeMap.set(g.id, g.type)
  })

  // Initialize Philosophy Groups
  const philosophyGroups: Record<string, typeof budgetBalances> = {
    need: [],
    want: [],
    savings: [],
    uncategorized: []
  }

  // Distribute budgets into philosophy groups
  budgetBalances.forEach(budget => {
    // Skip System budget as it is shown in summary cards
    if (budget.name === 'To Be Budgeted') return

    const groupType = groupTypeMap.get(budget.category_id)
    if (groupType && (groupType === 'need' || groupType === 'want' || groupType === 'savings')) {
      philosophyGroups[groupType].push(budget)
    } else {
      philosophyGroups.uncategorized.push(budget)
    }
  })

  // Construct finalGroups array for rendering
  const finalGroups: {
    id: string
    title: string
    type: 'need' | 'want' | 'savings' | null
    sort_order: number
    budgets: typeof budgetBalances
  }[] = [
    {
      id: 'needs-group',
      title: 'Needs',
      type: 'need',
      sort_order: 1,
      budgets: philosophyGroups.need.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },
    {
      id: 'wants-group',
      title: 'Wants',
      type: 'want',
      sort_order: 2,
      budgets: philosophyGroups.want.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },
    {
      id: 'savings-group',
      title: 'Savings',
      type: 'savings',
      sort_order: 3,
      budgets: philosophyGroups.savings.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }
  ]

  if (philosophyGroups.uncategorized.length > 0) {
    finalGroups.push({
      id: 'uncategorized-group',
      title: 'Uncategorized',
      type: null,
      sort_order: 4,
      budgets: philosophyGroups.uncategorized.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    })
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link 
          href="/transactions/new" 
          className="w-full sm:w-auto bg-black text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + Log Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <BalanceCard
          title="Total Cash"
          amount={summary.total_cash}
        />

        <BalanceCard 
          title="To Be Budgeted" 
          amount={tbbAmount}
          variant={tbbAmount < 0 ? 'danger' : 'success'}
        />
        
        <BalanceCard 
          title="Total Budgeted" 
          amount={summary.total_budgeted - tbbAmount} 
          subtitle="Assigned to envelopes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Accounts & Recent Activity */}
        <div className="space-y-8">
          {/* Accounts Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex justify-between items-center dark:text-white">
              Accounts
              <span className="text-sm font-normal text-gray-500">
                {accountBalances.length} accounts
              </span>
            </h2>
            
            <AccountList accounts={accountBalances} />
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold dark:text-white">Recent Activity</h2>
              <Link href="/transactions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
              {recentTransactions.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent activity.
                </div>
              ) : (
                recentTransactions.map(tx => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col min-w-0 mr-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm capitalize" title={tx.description || tx.type}>
                        {tx.description || tx.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.date}
                      </span>
                    </div>
                    <div className={`font-mono text-sm font-medium whitespace-nowrap ${
                      tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 
                      tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {formatMoney(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Budget Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Budget</h2>
          
          {finalGroups.length === 0 ? (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No categories yet.
            </div>
          ) : (
            finalGroups.map(group => (
              <GroupSection 
                key={group.id} 
                group={group as any} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
