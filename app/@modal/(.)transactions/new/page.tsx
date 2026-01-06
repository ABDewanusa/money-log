import { createClient } from '@/utils/supabase/server'
import { getAccounts, getBudgets, getCategories } from '@/app/lib/api'
import ModalTransactionForm from '@/app/components/transactions/ModalTransactionForm'
import Modal from '@/app/components/ui/Modal'
import { redirect } from 'next/navigation'

export default async function InterceptedNewTransactionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [accounts, budgets, categories] = await Promise.all([
    getAccounts(),
    getBudgets(),
    getCategories()
  ])

  // Create a map of category IDs to titles
  const categoryMap = new Map(categories.map(c => [c.id, c.title]))

  // Filter out archived items and add category_title
  const activeAccounts = accounts.filter(a => !a.is_archived)
  const activeBudgets = budgets
    .filter(b => !b.is_archived)
    .map(b => ({
      ...b,
      category_title: categoryMap.get(b.category_id) || 'Uncategorized'
    }))

  return (
    <Modal>
      <div className="bg-white dark:bg-slate-800 p-0 rounded-lg">
        {/* We reuse the form styles but remove the container wrapper since Modal provides it */}
        <ModalTransactionForm 
          accounts={activeAccounts} 
          budgets={activeBudgets} 
        />
      </div>
    </Modal>
  )
}
