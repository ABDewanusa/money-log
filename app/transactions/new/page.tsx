
import { createClient } from '@/utils/supabase/server'
import { getAccounts, getBudgets, getCategories } from '@/app/lib/api'
import StandardTransactionForm from '@/app/components/transactions/StandardTransactionForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewTransactionPage() {
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

      <StandardTransactionForm 
        accounts={activeAccounts} 
        budgets={activeBudgets} 
      />
    </div>
  )
}
