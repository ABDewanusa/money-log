import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAccountBalances, getBucketBalances, getGroups, getRecentTransactions } from '@/app/lib/api'
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
  const [groups, bucketBalances, accountBalances, recentTransactions] = await Promise.all([
    getGroups(),
    getBucketBalances(),
    getAccountBalances(),
    getRecentTransactions(5)
  ])

  // Calculate summary from balances
  const total_cash = accountBalances.reduce((sum, acc) => sum + acc.balance, 0)
  const total_budgeted = bucketBalances.reduce((sum, bucket) => sum + bucket.balance, 0)
  const summary = {
    total_cash,
    total_budgeted
  }

  // 2. Combine groups with their buckets
  const groupsWithBuckets = groups.map(group => ({
    ...group,
    buckets: bucketBalances.filter(b => b.group_id === group.id)
  }))

  // 3. Identify "To Be Budgeted" bucket (System)
  const tbbBucket = bucketBalances.find(b => b.name === 'To Be Budgeted')
  const tbbAmount = tbbBucket ? tbbBucket.balance : 0

  // 4. Group Buckets by Philosophy Type (Need, Want, Savings)
  
  // Create a map of Group ID -> Group Type
  const groupTypeMap = new Map<string, string>()
  groups.forEach(g => {
    if (g.type) groupTypeMap.set(g.id, g.type)
  })

  // Initialize Philosophy Groups
  const philosophyGroups: Record<string, typeof bucketBalances> = {
    need: [],
    want: [],
    savings: [],
    uncategorized: []
  }

  // Distribute buckets into philosophy groups
  bucketBalances.forEach(bucket => {
    // Skip System bucket as it is shown in summary cards
    if (bucket.name === 'To Be Budgeted') return

    const groupType = groupTypeMap.get(bucket.group_id)
    if (groupType && (groupType === 'need' || groupType === 'want' || groupType === 'savings')) {
      philosophyGroups[groupType].push(bucket)
    } else {
      philosophyGroups.uncategorized.push(bucket)
    }
  })

  // Construct finalGroups array for rendering
  const finalGroups: {
    id: string
    title: string
    type: 'need' | 'want' | 'savings' | null
    sort_order: number
    buckets: typeof bucketBalances
  }[] = [
    {
      id: 'needs-group',
      title: 'Needs',
      type: 'need',
      sort_order: 1,
      buckets: philosophyGroups.need.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },
    {
      id: 'wants-group',
      title: 'Wants',
      type: 'want',
      sort_order: 2,
      buckets: philosophyGroups.want.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },
    {
      id: 'savings-group',
      title: 'Savings',
      type: 'savings',
      sort_order: 3,
      buckets: philosophyGroups.savings.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }
  ]

  if (philosophyGroups.uncategorized.length > 0) {
    finalGroups.push({
      id: 'uncategorized-group',
      title: 'Uncategorized',
      type: null,
      sort_order: 4,
      buckets: philosophyGroups.uncategorized.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
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
              No budget groups yet.
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
