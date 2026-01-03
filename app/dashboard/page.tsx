import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAccountBalances, getBucketBalances, getDashboardSummary, getGroups } from '@/app/lib/api'
import { formatMoney } from '@/utils/format/money'
import { BalanceCard } from '@/app/components/BalanceCard'
import { GroupSection } from '@/app/components/GroupSection'
import { AccountList } from '@/app/components/AccountList'

import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch all data in parallel
  const [groups, bucketBalances, accountBalances, summary] = await Promise.all([
    getGroups(),
    getBucketBalances(),
    getAccountBalances(),
    getDashboardSummary()
  ])

  // 2. Combine groups with their buckets
  const groupsWithBuckets = groups.map(group => ({
    ...group,
    buckets: bucketBalances.filter(b => b.group_id === group.id)
  }))

  // 3. Identify "To Be Budgeted" bucket (System)
  const tbbBucket = bucketBalances.find(b => b.name === 'To Be Budgeted')
  const tbbAmount = tbbBucket ? tbbBucket.balance : 0

  // 4. Filter out System group from main list
  const visibleGroups = groupsWithBuckets.filter(g => g.title !== 'System')

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Cash</div>
          <div className="text-xl font-bold">{formatMoney(summary.total_cash)}</div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/transactions/new" 
          className="flex-1 sm:flex-none bg-black text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors shadow-sm"
        >
          + Log Transaction
        </Link>
        <Link 
          href="/transactions" 
          className="flex-1 sm:flex-none bg-white text-gray-700 border px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          Transactions
        </Link>
        <Link 
          href="/settings" 
          className="flex-1 sm:flex-none bg-white text-gray-700 border px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          Settings
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        {/* Accounts Column - Mobile First: Stacks on top */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex justify-between items-center">
            Accounts
            <span className="text-sm font-normal text-gray-500">
              {accountBalances.length} accounts
            </span>
          </h2>
          
          <AccountList accounts={accountBalances} />
        </div>

        {/* Budget Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Budget</h2>
          
          {visibleGroups.length === 0 ? (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No budget groups yet.
            </div>
          ) : (
            visibleGroups.map(group => (
              <GroupSection 
                key={group.id} 
                group={group} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
