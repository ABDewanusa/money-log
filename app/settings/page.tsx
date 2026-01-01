import { getAccounts, getBuckets, getGroups } from '@/app/lib/api'
import { createAccount, archiveAccount, createBucket } from '@/app/actions/settings'
import { formatMoney } from '@/utils/format/money'
import Link from 'next/link'

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

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-100">
            {accounts.map(account => (
              <div key={account.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${account.is_archived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {account.name}
                    </span>
                    {account.is_archived && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Archived</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')}</span>
                </div>
                {!account.is_archived && (
                  <form action={archiveAccount}>
                    <input type="hidden" name="account_id" value={account.id} />
                    <button 
                      type="submit"
                      className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Archive
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
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
                {groups.map(group => (
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

        {/* Buckets List by Group */}
        <div className="space-y-6">
          {groups.map(group => {
            const groupBuckets = buckets.filter(b => b.group_id === group.id)
            if (groupBuckets.length === 0) return null

            return (
              <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-sm text-gray-700">{group.title}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupBuckets.map(bucket => (
                    <div key={bucket.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{bucket.name}</span>
                        {bucket.target_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Target: {formatMoney(bucket.target_amount)}
                          </div>
                        )}
                      </div>
                      {/* Placeholder for future edit/move actions */}
                      <div className="text-xs text-gray-400">
                        {/* No archive for buckets requested, but could be added easily */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
