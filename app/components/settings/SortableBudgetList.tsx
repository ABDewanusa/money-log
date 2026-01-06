'use client'

import { useState, useEffect, useId } from 'react'
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
import { updateBudgetOrder } from '@/app/actions/settings'
import { formatMoney } from '@/utils/format/money'
import { Category, Budget } from '@/app/lib/api'

function SortableBudgetItem({ 
  budget, 
  groups,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdate
}: { 
  budget: Budget
  groups: Category[]
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onUpdate: (formData: FormData) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: budget.id })

  const [isEditing, setIsEditing] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="group p-3 sm:p-4 flex flex-row items-center justify-between bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 last:border-0 gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing px-1 flex-shrink-0">
          ⋮⋮
        </button>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium truncate ${budget.is_archived ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
              {budget.name}
            </span>
            {budget.is_archived && (
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded flex-shrink-0">Archived</span>
            )}
          </div>
          
          {isEditing ? (
            <form 
              action={async (formData) => {
                onUpdate(formData)
                setIsEditing(false)
              }}
              className="mt-1 flex items-center gap-2 flex-wrap"
            >
              <input type="hidden" name="budget_id" value={budget.id} />
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Target:</span>
                <input 
                  name="target_amount" 
                  type="number" 
                  step="0.01" 
                  defaultValue={budget.target_amount / 100}
                  className="w-20 text-xs p-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditing(false)
                  }}
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Category:</span>
                <select 
                  name="category_id"
                  defaultValue={budget.category_id}
                  className="text-xs p-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white max-w-[120px]"
                >
                  {groups.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 px-1">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-1">Cancel</button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-0.5 h-5">
               <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                 Target: {budget.target_amount > 0 ? formatMoney(budget.target_amount) : '$0.00'}
               </div>
               {!budget.is_archived && (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                 >
                   Edit
                 </button>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
        {budget.name !== 'To Be Budgeted' && (
          <>
            {!budget.is_archived ? (
              <form action={() => onArchive(budget.id)}>
                <button 
                  type="submit"
                  className="w-20 text-xs font-medium text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 px-3 py-1.5 rounded transition-colors"
                >
                  Archive
                </button>
              </form>
            ) : (
              <form action={() => onUnarchive(budget.id)}>
                <button 
                  type="submit"
                  className="w-20 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded transition-colors"
                >
                  Unarchive
                </button>
              </form>
            )}
            <form action={() => onDelete(budget.id)}>
              <button 
                type="submit"
                className="w-20 flex-shrink-0 text-xs font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded transition-colors"
              >
                Delete
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function SortableBudgetList({ 
  budgets, 
  groups,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdate,
  id: propId
}: { 
  budgets: Budget[] 
  groups: Category[] 
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onUpdate: (formData: FormData) => void
  id?: string
}) {
  const generatedId = useId()
  const dndId = propId || generatedId
  const [items, setItems] = useState(budgets)

  useEffect(() => {
    setItems(budgets.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  }, [budgets])

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
        
        // Prepare updates
        const updates = newItems.map((item, index) => ({
          id: item.id,
          sort_order: index
        }))
        
        updateBudgetOrder(updates)
        
        return newItems
      })
    }
  }

  return (
    <DndContext 
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-gray-200 dark:divide-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {items.map(budget => (
            <SortableBudgetItem 
              key={budget.id} 
              budget={budget} 
              groups={groups} 
              onDelete={onDelete}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
