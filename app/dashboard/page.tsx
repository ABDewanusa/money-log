import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAccountBalances, getBucketBalances, getDashboardSummary, getGroups } from '@/app/lib/api'
import { formatMoney } from '@/utils/format/money'
import { BalanceCard } from '@/app/components/BalanceCard'
import { GroupSection } from '@/app/components/GroupSection'
import { AccountList } from '@/app/components/AccountList'

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <BalanceCard 
          title="Total Budgeted" 
          amount={summary.total_budgeted} 
        />
        
        <BalanceCard 
          title="Unallocated Check" 
          amount={summary.unallocated_error_check}
          variant={summary.unallocated_error_check !== 0 ? 'danger' : 'success'}
          subtitle={summary.unallocated_error_check !== 0 ? 'Should be $0.00!' : undefined}
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
          
          {groupsWithBuckets.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
              No budget groups found.
            </div>
          ) : (
            <div className="space-y-6">
              {groupsWithBuckets.map((group) => (
                <GroupSection key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
