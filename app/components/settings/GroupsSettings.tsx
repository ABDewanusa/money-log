'use client'

import { createGroup } from '@/app/actions/settings'
import SortableGroupList from './SortableGroupList'
import SubmitButton from '../ui/SubmitButton'
import { Group } from '@/app/lib/api'

export default function GroupsSettings({ groups }: { groups: Group[] }) {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Budget Groups</h2>

      {/* Create Group Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Group</h3>
        <form action={createGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Group Name</label>
              <input 
                name="title" 
                placeholder="e.g. Housing, Fun, etc." 
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Core Type (Philosophy)</label>
              <select 
                name="type" 
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Type...</option>
                <option value="need">Need</option>
                <option value="want">Want</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>
          <SubmitButton pendingText="Adding Group...">
            Add Group
          </SubmitButton>
        </form>
      </div>

      {/* Groups List */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Groups</h3>
        <SortableGroupList groups={groups.filter(g => g.title !== 'System')} />
      </div>
    </section>
  )
}
