import { getAccounts, getBuckets, getGroups } from '@/app/lib/api'
import { createAccount, createBucket } from '@/app/actions/settings'
import { formatMoney } from '@/utils/format/money'
import Link from 'next/link'
import SortableAccountList from '@/app/components/SortableAccountList'
import SortableBucketList from '@/app/components/SortableBucketList'

export default async function SettingsPage() {
  const [accounts, buckets, groups] = await Promise.all([
    getAccounts(),
    getBuckets(),
    getGroups()
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
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Accounts</h2>
        
        {/* Create Account Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Account</h3>
          <form action={createAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Account Name</label>
                <input 
                  name="name" 
                  placeholder="e.g. Chase Checking" 
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Type</label>
                <select 
                  name="type" 
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  defaultValue="checking"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Add Account
            </button>
          </form>
        </div>

        {/* Accounts List (Sortable) */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Accounts</h3>
          <SortableAccountList accounts={accounts} />
        </div>
      </section>

      {/* Buckets Section */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Buckets</h2>

        {/* Create Bucket Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Bucket</h3>
          <form action={createBucket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Bucket Name</label>
                <input 
                  name="name" 
                  placeholder="e.g. Groceries" 
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Group</label>
                <select 
                  name="group_id" 
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.filter(g => g.title !== 'System').map(group => (
                    <option key={group.id} value={group.id}>{group.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Target Amount (Optional)</label>
                <input 
                  name="target_amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Add Bucket
            </button>
          </form>
        </div>

        {/* Buckets List by Group (Sortable) */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Buckets</h3>
          {groups.filter(g => g.title !== 'System').map(group => {
            const groupBuckets = buckets.filter(b => b.group_id === group.id)
            if (groupBuckets.length === 0) return null

            return (
              <div key={group.id}>
                <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-1">{group.title}</h4>
                <SortableBucketList buckets={groupBuckets} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
