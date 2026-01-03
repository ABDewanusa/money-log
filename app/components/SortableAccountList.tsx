'use client'

import { useState, useId } from 'react'
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
import { updateAccountOrder, updateAccountType, archiveAccount, unarchiveAccount, deleteAccount } from '@/app/actions/settings'

type Account = {
  id: string
  name: string
  type: string
  is_archived: boolean
  sort_order?: number
}

function SortableItem({ account }: { account: Account }) {
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
    <div ref={setNodeRef} style={style} className="p-4 flex items-center justify-between bg-white border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1">
          ⋮⋮
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${account.is_archived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {account.name}
            </span>
            {account.is_archived && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Archived</span>
            )}
          </div>
          
          {isEditing ? (
            <form action={async (formData) => {
              await updateAccountType(formData)
              setIsEditing(false)
            }} className="flex gap-2 mt-1">
              <input type="hidden" name="account_id" value={account.id} />
              <select 
                name="type" 
                defaultValue={account.type}
                className="text-xs p-1 border rounded"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
              <button type="submit" className="text-xs bg-green-50 text-green-700 px-2 rounded border border-green-200">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-500 px-1">Cancel</button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')}</span>
              {!account.is_archived && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Edit Type
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!account.is_archived ? (
          <form action={archiveAccount}>
            <input type="hidden" name="account_id" value={account.id} />
            <button 
              type="submit"
              className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 px-2 py-1 rounded hover:bg-orange-50"
            >
              Archive
            </button>
          </form>
        ) : (
          <form action={unarchiveAccount}>
            <input type="hidden" name="account_id" value={account.id} />
            <button 
              type="submit"
              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
            >
              Unarchive
            </button>
          </form>
        )}
        <form action={deleteAccount}>
          <input type="hidden" name="account_id" value={account.id} />
          <button 
            type="submit"
            className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SortableAccountList({ accounts }: { accounts: Account[] }) {
  const id = useId()
  // Sort accounts by sort_order locally
  const [items, setItems] = useState(accounts.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  
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
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-100">
          {items.map(account => (
            <SortableItem key={account.id} account={account} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
