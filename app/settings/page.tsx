import { getAccounts, getBudgets, getCategories } from '@/app/lib/api'
import Link from 'next/link'
import AccountsSettings from '@/app/components/settings/AccountsSettings'
import BudgetsSettings from '@/app/components/settings/BudgetsSettings'
import GroupsSettings from '@/app/components/settings/GroupsSettings'

export default async function SettingsPage() {
  const [accounts, budgets, categories] = await Promise.all([
    getAccounts(),
    getBudgets(),
    getCategories()
  ])

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        <Link 
          href="/dashboard" 
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &larr; Back
        </Link>
      </div>

      {/* Accounts Section */}
      <AccountsSettings accounts={accounts} />

      {/* Categories Section */}
      <GroupsSettings groups={categories} />

      {/* Budgets Section */}
      <BudgetsSettings budgets={budgets} groups={categories} />
    </div>
  )
}
