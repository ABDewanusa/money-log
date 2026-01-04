'use client'

import { useState, useEffect } from 'react'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateAccountOrder } from '@/app/actions/settings'
import { Account } from '@/app/lib/api'

function SortableItem({ 
  account, 
  onDelete, 
  onArchive, 
  onUnarchive, 
  onUpdateType 
}: { 
  account: Account
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onUpdateType: (formData: FormData) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  }

  const [isEditing, setIsEditing] = useState(false)

  return (
    <div ref={setNodeRef} style={style} className="p-3 sm:p-4 flex flex-row items-center justify-between bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 last:border-0 gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing px-1 flex-shrink-0">
          ⋮⋮
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${account.is_archived ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
              {account.name}
            </span>
            {account.is_archived && (
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded flex-shrink-0">Archived</span>
            )}
          </div>
          
          {isEditing ? (
            <form action={async (formData) => {
              onUpdateType(formData)
              setIsEditing(false)
            }} className="flex gap-2 mt-1 flex-wrap">
              <input type="hidden" name="account_id" value={account.id} />
              <select 
                name="type" 
                defaultValue={account.type}
                className="text-xs p-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
              <button type="submit" className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 rounded border border-green-200 dark:border-green-800">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-500 dark:text-gray-400 px-1">Cancel</button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{account.type.replace('_', ' ')}</span>
              {!account.is_archived && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                >
                  Edit Type
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
        {!account.is_archived ? (
          <form action={() => onArchive(account.id)}>
            <button 
              type="submit"
              className="w-20 text-xs font-medium text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 px-3 py-1.5 rounded transition-colors"
            >
              Archive
            </button>
          </form>
        ) : (
          <form action={() => onUnarchive(account.id)}>
            <button 
              type="submit"
              className="w-20 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded transition-colors"
            >
              Unarchive
            </button>
          </form>
        )}
        <form action={() => onDelete(account.id)}>
          <button 
            type="submit"
            className="w-20 flex-shrink-0 text-xs font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SortableAccountList({ 
  accounts,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdateType
}: { 
  accounts: Account[] 
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onUpdateType: (formData: FormData) => void
}) {
  // Sort accounts by sort_order locally
  const [items, setItems] = useState(accounts.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  
  useEffect(() => {
    setItems(accounts.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  }, [accounts])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Prepare updates with new sort_order
        const updates = newItems.map((item, index) => ({
          id: item.id,
          sort_order: index
        }))
        
        // Trigger server action
        updateAccountOrder(updates)
        
        return newItems
      })
    }
  }

  return (
    <DndContext 
      id="dnd-accounts"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-gray-200 dark:divide-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {items.map(account => (
            <SortableItem 
              key={account.id} 
              account={account} 
              onDelete={onDelete}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onUpdateType={onUpdateType}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
