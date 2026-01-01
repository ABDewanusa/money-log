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
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">New Transaction</h2>

      {/* Type Selector */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {(['expense', 'income', 'transfer', 'bucket_move'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            type="button"
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md capitalize whitespace-nowrap transition-colors ${
              type === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <form id="transaction-form" action={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
        )}

        {/* Common Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full p-2 border rounded text-lg font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
          <input
            name="description"
            type="text"
            placeholder="What is this for?"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Dynamic Fields */}
        <div className="grid gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          
          {/* FROM ACCOUNT */}
          {(type === 'expense' || type === 'transfer') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">From Account</label>
              <select name="from_account_id" required className="w-full p-2 border rounded bg-white">
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* TO ACCOUNT */}
          {(type === 'income' || type === 'transfer') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">To Account</label>
              <select name="to_account_id" required className="w-full p-2 border rounded bg-white">
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* FROM BUCKET */}
          {(type === 'expense' || type === 'bucket_move') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">From Bucket</label>
              <select name="from_bucket_id" required className="w-full p-2 border rounded bg-white">
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">To Bucket</label>
              <select name="to_bucket_id" required className="w-full p-2 border rounded bg-white">
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
          className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    </div>
  )
}
