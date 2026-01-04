'use client'

import { useOptimistic, useRef } from 'react'
import { createAccount, deleteAccount, archiveAccount, unarchiveAccount, updateAccountType } from '@/app/actions/settings'
import SortableAccountList from './SortableAccountList'
import SubmitButton from '../ui/SubmitButton'
import { Account } from '@/app/lib/api'

type AccountAction = 
  | { type: 'ADD', payload: Account }
  | { type: 'DELETE', payload: string }
  | { type: 'ARCHIVE', payload: string }
  | { type: 'UNARCHIVE', payload: string }
  | { type: 'UPDATE_TYPE', payload: { id: string, type: string } }

export default function AccountsSettings({ accounts }: { accounts: Account[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  
  const [optimisticAccounts, dispatch] = useOptimistic(
    accounts,
    (state, action: AccountAction) => {
      switch (action.type) {
        case 'ADD':
          return [...state, action.payload]
        case 'DELETE':
          return state.filter(a => a.id !== action.payload)
        case 'ARCHIVE':
          return state.map(a => a.id === action.payload ? { ...a, is_archived: true } : a)
        case 'UNARCHIVE':
          return state.map(a => a.id === action.payload ? { ...a, is_archived: false } : a)
        case 'UPDATE_TYPE':
          return state.map(a => 
            a.id === action.payload.id ? { ...a, type: action.payload.type } : a
          )
        default:
          return state
      }
    }
  )

  async function handleAddAccount(formData: FormData) {
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    
    // Generate temporary ID
    const tempId = crypto.randomUUID()
    
    const newAccount: Account = {
      id: tempId,
      name,
      type,
      is_archived: false,
      sort_order: optimisticAccounts.length
    }
    
    dispatch({ type: 'ADD', payload: newAccount })
    formRef.current?.reset()
    
    await createAccount(formData)
  }

  async function handleDelete(id: string) {
    dispatch({ type: 'DELETE', payload: id })
    const fd = new FormData()
    fd.append('account_id', id)
    await deleteAccount(fd)
  }

  async function handleArchive(id: string) {
    dispatch({ type: 'ARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('account_id', id)
    await archiveAccount(fd)
  }

  async function handleUnarchive(id: string) {
    dispatch({ type: 'UNARCHIVE', payload: id })
    const fd = new FormData()
    fd.append('account_id', id)
    await unarchiveAccount(fd)
  }

  async function handleUpdateType(formData: FormData) {
    const id = formData.get('account_id') as string
    const type = formData.get('type') as string
    
    dispatch({ type: 'UPDATE_TYPE', payload: { id, type } })
    await updateAccountType(formData)
  }

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Accounts</h2>
        
        {/* Create Account Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Account</h3>
          <form action={handleAddAccount} ref={formRef} className="space-y-4">
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
            <SubmitButton pendingText="Adding Account...">
              Add Account
            </SubmitButton>
          </form>
        </div>

        {/* Accounts List (Sortable) */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Accounts</h3>
          <SortableAccountList 
            accounts={optimisticAccounts}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onUpdateType={handleUpdateType}
          />
        </div>
    </section>
  )
}
