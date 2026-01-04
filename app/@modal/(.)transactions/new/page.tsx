import { createClient } from '@/utils/supabase/server'
import { getAccounts, getBuckets, getGroups } from '@/app/lib/api'
import ModalTransactionForm from '@/app/components/transactions/ModalTransactionForm'
import Modal from '@/app/components/ui/Modal'
import { redirect } from 'next/navigation'

export default async function InterceptedNewTransactionPage() {
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
    <Modal>
      <div className="bg-white dark:bg-slate-800 p-0 rounded-lg">
        {/* We reuse the form styles but remove the container wrapper since Modal provides it */}
        <ModalTransactionForm 
          accounts={activeAccounts} 
          buckets={activeBuckets} 
        />
      </div>
    </Modal>
  )
}
