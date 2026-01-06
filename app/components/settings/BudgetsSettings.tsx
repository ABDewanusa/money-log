'use client'

import { useOptimistic, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBudget, deleteBudget, archiveBudget, unarchiveBudget, updateBudget } from '@/app/actions/settings'
import SortableBudgetList from './SortableBudgetList'
import SubmitButton from '../ui/SubmitButton'
import { Budget, Category } from '@/app/lib/api'

type BudgetAction = 
  | { type: 'ADD', payload: Budget }
  | { type: 'DELETE', payload: string }
  | { type: 'ARCHIVE', payload: string }
  | { type: 'UNARCHIVE', payload: string }
  | { type: 'UPDATE', payload: { id: string, target_amount?: number, category_id?: string } }

export default function BudgetsSettings({ budgets, groups }: { budgets: Budget[], groups: Category[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  
  const [optimisticBudgets, dispatch] = useOptimistic(
    budgets,
    (state, action: BudgetAction) => {
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
              category_id: action.payload.category_id !== undefined ? action.payload.category_id : b.category_id
            } : b
          )
        default:
          return state
      }
    }
  )

  async function handleAddBudget(formData: FormData) {
    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string
    const targetStr = formData.get('target_amount') as string
    
    // Generate temporary ID
    const tempId = crypto.randomUUID()
    
    const newBudget: Budget = {
      id: tempId,
      name,
      category_id: categoryId,
      target_amount: targetStr ? Math.round(parseFloat(targetStr) * 100) : 0,
      is_archived: false,
      sort_order: optimisticBudgets.length,
      created_at: new Date().toISOString() 
    }
    
    dispatch({ type: 'ADD', payload: newBudget })
    formRef.current?.reset()
    
    await createBudget(formData)
    router.refresh()
  }

  async function handleDelete(id: string) {
    dispatch({ type: 'DELETE', payload: id })
    const fd = new FormData()
    fd.append('budget_id', id)
    await deleteBudget(fd)
    router.refresh()
  }

  async function handleArchive(id: string) {
    dispatch({ type: 'ARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('budget_id', id)
    await archiveBudget(fd)
    router.refresh()
  }

  async function handleUnarchive(id: string) {
    dispatch({ type: 'UNARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('budget_id', id)
    await unarchiveBudget(fd)
    router.refresh()
  }

  async function handleUpdate(formData: FormData) {
    const id = formData.get('budget_id') as string
    const targetStr = formData.get('target_amount') as string
    const categoryId = formData.get('category_id') as string
    
    const updates: { id: string, target_amount?: number, category_id?: string } = { id }
    if (targetStr !== null) {
      updates.target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0
    }
    if (categoryId) {
      updates.category_id = categoryId
    }
    
    dispatch({ type: 'UPDATE', payload: updates })
    await updateBudget(formData)
    router.refresh()
  }

  const nonSystemGroups = groups.filter(g => g.title !== 'System')

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Budgets</h2>

      {/* Create Budget Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Budget</h3>
        <form action={handleAddBudget} ref={formRef} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Budget Name</label>
              <input 
                name="name" 
                placeholder="e.g. Groceries" 
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Category</label>
              <select 
                name="category_id" 
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Category...</option>
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
            <SubmitButton pendingText="Adding Budget...">
              Add Budget
            </SubmitButton>
          </form>
      </div>

      {/* Budgets List by Group (Sortable) */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Budgets</h3>
        {nonSystemGroups.map(group => {
          const groupBudets = optimisticBudgets.filter(b => b.category_id === group.id)
          if (groupBudets.length === 0) return null

          return (
            <div key={group.id}>
              <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-1">{group.title}</h4>
              <SortableBudgetList 
                id={`dnd-budgets-${group.id}`}
                budgets={groupBudets} 
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
