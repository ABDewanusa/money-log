'use client'

import { useOptimistic, useRef } from 'react'
import { createBucket, deleteBucket, archiveBucket, unarchiveBucket, updateBucket } from '@/app/actions/settings'
import SortableBucketList from './SortableBucketList'
import SubmitButton from '../ui/SubmitButton'
import { Bucket, Group } from '@/app/lib/api'

type BucketAction = 
  | { type: 'ADD', payload: Bucket }
  | { type: 'DELETE', payload: string }
  | { type: 'ARCHIVE', payload: string }
  | { type: 'UNARCHIVE', payload: string }
  | { type: 'UPDATE', payload: { id: string, target_amount?: number, group_id?: string } }

export default function BucketsSettings({ buckets, groups }: { buckets: Bucket[], groups: Group[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  
  const [optimisticBuckets, dispatch] = useOptimistic(
    buckets,
    (state, action: BucketAction) => {
      switch (action.type) {
        case 'ADD':
          return [...state, action.payload]
        case 'DELETE':
          return state.filter(b => b.id !== action.payload)
        case 'ARCHIVE':
          return state.map(b => b.id === action.payload ? { ...b, is_archived: true } : b)
        case 'UNARCHIVE':
          return state.map(b => b.id === action.payload ? { ...b, is_archived: false } : b)
        case 'UPDATE':
          return state.map(b => 
            b.id === action.payload.id ? { 
              ...b, 
              target_amount: action.payload.target_amount !== undefined ? action.payload.target_amount : b.target_amount,
              group_id: action.payload.group_id !== undefined ? action.payload.group_id : b.group_id
            } : b
          )
        default:
          return state
      }
    }
  )

  async function handleAddBucket(formData: FormData) {
    const name = formData.get('name') as string
    const groupId = formData.get('group_id') as string
    const targetStr = formData.get('target_amount') as string
    
    // Generate temporary ID
    const tempId = crypto.randomUUID()
    
    const newBucket: Bucket = {
      id: tempId,
      name,
      group_id: groupId,
      target_amount: targetStr ? Math.round(parseFloat(targetStr) * 100) : 0,
      is_archived: false,
      sort_order: optimisticBuckets.length
    }
    
    dispatch({ type: 'ADD', payload: newBucket })
    formRef.current?.reset()
    
    await createBucket(formData)
  }

  async function handleDelete(id: string) {
    dispatch({ type: 'DELETE', payload: id })
    const fd = new FormData()
    fd.append('bucket_id', id)
    await deleteBucket(fd)
  }

  async function handleArchive(id: string) {
    dispatch({ type: 'ARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('bucket_id', id)
    await archiveBucket(fd)
  }

  async function handleUnarchive(id: string) {
    dispatch({ type: 'UNARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('bucket_id', id)
    await unarchiveBucket(fd)
  }

  async function handleUpdate(formData: FormData) {
    const id = formData.get('bucket_id') as string
    const targetStr = formData.get('target_amount') as string
    const groupId = formData.get('group_id') as string
    
    const updates: { id: string, target_amount?: number, group_id?: string } = { id }
    if (targetStr !== null) {
      updates.target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0
    }
    if (groupId) {
      updates.group_id = groupId
    }
    
    dispatch({ type: 'UPDATE', payload: updates })
    await updateBucket(formData)
  }

  const nonSystemGroups = groups.filter(g => g.title !== 'System')

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Buckets</h2>

      {/* Create Bucket Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Bucket</h3>
        <form action={handleAddBucket} ref={formRef} className="space-y-4">
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
                {nonSystemGroups.map(group => (
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
            <SubmitButton pendingText="Adding Bucket...">
              Add Bucket
            </SubmitButton>
          </form>
      </div>

      {/* Buckets List by Group (Sortable) */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Buckets</h3>
        {nonSystemGroups.map(group => {
          const groupBuckets = optimisticBuckets.filter(b => b.group_id === group.id)
          if (groupBuckets.length === 0) return null

          return (
            <div key={group.id}>
              <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-1">{group.title}</h4>
              <SortableBucketList 
                id={`dnd-buckets-${group.id}`}
                buckets={groupBuckets} 
                groups={nonSystemGroups} 
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onUpdate={handleUpdate}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
