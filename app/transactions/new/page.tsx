
import { createClient } from '@/utils/supabase/server'
import { getAccounts, getBuckets, getGroups } from '@/app/lib/api'
import TransactionForm from '@/app/components/TransactionForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewTransactionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [accounts, buckets, groups] = await Promise.all([
    getAccounts(),
    getBuckets(),
    getGroups()
  ])

  // Create a map of group IDs to titles
  const groupMap = new Map(groups.map(g => [g.id, g.title]))

  // Filter out archived items and add group_title
  const activeAccounts = accounts.filter(a => !a.is_archived)
  const activeBuckets = buckets
    .filter(b => !b.is_archived)
    .map(b => ({
      ...b,
      group_title: groupMap.get(b.group_id) || 'Uncategorized'
    }))

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">New Transaction</h1>
        <Link 
          href="/transactions" 
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &larr; Cancel
        </Link>
      </div>

      <TransactionForm 
        accounts={activeAccounts} 
        buckets={activeBuckets} 
      />
    </div>
  )
}
