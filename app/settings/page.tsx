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
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link 
          href="/dashboard" 
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          &larr; Back
        </Link>
      </div>

      {/* Accounts Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Accounts</h2>
        
        {/* Create Account Form */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium mb-3">Add New Account</h3>
          <form action={createAccount} className="flex flex-col sm:flex-row gap-3">
            <input 
              name="name" 
              placeholder="Account Name" 
              className="flex-1 p-2 border rounded text-sm"
              required 
            />
            <select 
              name="type" 
              className="p-2 border rounded text-sm"
              defaultValue="checking"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
            <button 
              type="submit" 
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              Add
            </button>
          </form>
        </div>

        {/* Accounts List (Sortable) */}
        <SortableAccountList accounts={accounts} />
      </section>

      {/* Buckets Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buckets</h2>

        {/* Create Bucket Form */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium mb-3">Add New Bucket</h3>
          <form action={createBucket} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                name="name" 
                placeholder="Bucket Name" 
                className="flex-1 p-2 border rounded text-sm"
                required 
              />
              <select 
                name="group_id" 
                className="p-2 border rounded text-sm"
                required
              >
                <option value="">Select Group</option>
                {groups.filter(g => g.title !== 'System').map(group => (
                  <option key={group.id} value={group.id}>{group.title}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <input 
                name="target_amount" 
                type="number" 
                step="0.01" 
                placeholder="Target Amount (Optional)" 
                className="flex-1 p-2 border rounded text-sm"
              />
              <button 
                type="submit" 
                className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
              >
                Add Bucket
              </button>
            </div>
          </form>
        </div>

        {/* Buckets List by Group (Sortable) */}
        <div className="space-y-6">
          {groups.filter(g => g.title !== 'System').map(group => {
            const groupBuckets = buckets.filter(b => b.group_id === group.id)
            if (groupBuckets.length === 0) return null

            return (
              <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-sm text-gray-700">{group.title}</h3>
                </div>
                <SortableBucketList buckets={groupBuckets} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
