'use client'

import { useState } from 'react'
import { logTransaction } from '@/app/actions/logTransaction'
import { TransactionType } from '@/app/lib/schemas'

type Account = { id: string; name: string }
type Bucket = { id: string; name: string; group_title: string }

type Props = {
  accounts: Account[]
  buckets: Bucket[]
  onSuccess?: () => void
}

export default function TransactionForm({ accounts, buckets, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>('expense')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Default Date to today YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const rawData: any = {
      type,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
    }

    // Append conditional fields based on type
    if (type === 'expense') {
      rawData.from_account_id = formData.get('from_account_id')
      rawData.from_bucket_id = formData.get('from_bucket_id')
    } else if (type === 'income') {
      rawData.to_account_id = formData.get('to_account_id')
      rawData.to_bucket_id = formData.get('to_bucket_id')
    } else if (type === 'transfer') {
      rawData.from_account_id = formData.get('from_account_id')
      rawData.to_account_id = formData.get('to_account_id')
    } else if (type === 'bucket_move') {
      rawData.from_bucket_id = formData.get('from_bucket_id')
      rawData.to_bucket_id = formData.get('to_bucket_id')
    }

    const result = await logTransaction(rawData)

    if (result.success) {
      // Reset form or close modal
      if (onSuccess) onSuccess()
      else {
        // Basic reset if no callback
        const form = document.getElementById('transaction-form') as HTMLFormElement
        form.reset()
        // Reset type to default or keep? Keep is usually better for sequential entry.
        alert('Transaction Saved')
      }
    } else {
      setError(result.error || 'Failed to save transaction')
    }

    setIsSubmitting(false)
  }

  // Group buckets for display
  const groupedBuckets = buckets.reduce((acc, bucket) => {
    if (!acc[bucket.group_title]) acc[bucket.group_title] = []
    acc[bucket.group_title].push(bucket)
    return acc
  }, {} as Record<string, Bucket[]>)

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 max-w-lg mx-auto w-full">
      <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-gray-100">New Transaction</h2>

      {/* Type Selector */}
      <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg mb-6 overflow-x-auto border border-gray-200 dark:border-slate-600">
        {(['expense', 'income', 'transfer', 'bucket_move'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            type="button"
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md capitalize whitespace-nowrap transition-all ${
              type === t 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-black dark:text-white border border-gray-200 dark:border-slate-600' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <form id="transaction-form" action={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">{error}</div>
        )}

        {/* Common Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Amount</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-lg font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Date</label>
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Description</label>
          <input
            name="description"
            type="text"
            placeholder="What is this for?"
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
          />
        </div>

        {/* Dynamic Fields */}
        <div className="grid gap-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
          
          {/* FROM ACCOUNT */}
          {(type === 'expense' || type === 'transfer') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">From Account</label>
              <select name="from_account_id" required className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all">
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* TO ACCOUNT */}
          {(type === 'income' || type === 'transfer') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">To Account</label>
              <select name="to_account_id" required className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all">
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* FROM BUCKET */}
          {(type === 'expense' || type === 'bucket_move') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">From Bucket</label>
              <select name="from_bucket_id" required className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all">
                <option value="">Select Bucket</option>
                {Object.entries(groupedBuckets).map(([group, groupBuckets]) => (
                  <optgroup key={group} label={group}>
                    {groupBuckets.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* TO BUCKET */}
          {(type === 'income' || type === 'bucket_move') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">To Bucket</label>
              <select name="to_bucket_id" required className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all">
                <option value="">Select Bucket</option>
                {Object.entries(groupedBuckets).map(([group, groupBuckets]) => (
                  <optgroup key={group} label={group}>
                    {groupBuckets.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {isSubmitting ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    </div>
  )
}
