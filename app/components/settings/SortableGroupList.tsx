'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { updateCategory, deleteCategory, updateCategoryOrder } from '@/app/actions/settings'
import { Category } from '@/app/lib/api'

function SortableGroupItem({ group }: { group: Category }) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: group.id })

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
          {isEditing ? (
            <form action={async (formData) => {
              await updateCategory(formData)
              setIsEditing(false)
              router.refresh()
            }} className="flex gap-2 flex-wrap items-center">
              <input type="hidden" name="category_id" value={group.id} />
              
              <input 
                name="title" 
                defaultValue={group.title}
                className="text-sm p-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 w-32"
                required
              />
              
              <select 
                name="type" 
                defaultValue={group.type || ''}
                className="text-sm p-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
              >
                <option value="">No Type</option>
                <option value="need">Need</option>
                <option value="want">Want</option>
                <option value="savings">Savings</option>
              </select>

              <button type="submit" className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-500 dark:text-gray-400 px-1">Cancel</button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {group.title}
              </span>
              <div className="flex items-center gap-2">
                {group.type && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                    group.type === 'need' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                      : group.type === 'want'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  }`}>
                    {group.type}
                  </span>
                )}
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <form action={async (formData) => { await deleteCategory(formData); router.refresh() }}>
        <input type="hidden" name="category_id" value={group.id} />
        <button 
          type="submit" 
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete Category"
          onClick={(e) => {
            if (!confirm('Are you sure you want to delete this category? It must be empty.')) {
              e.preventDefault()
            }
          }}
        >
          <span className="sr-only">Delete</span>
          🗑️
        </button>
      </form>
    </div>
  )
}

export default function SortableGroupList({ groups }: { groups: Category[] }) {
  const [items, setItems] = useState(groups)
  const router = useRouter()
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
        
        updateCategoryOrder(newItems.map((item, index) => ({ id: item.id, sort_order: index })))
        
        return newItems
      })
    }
  }

  // Sync with server data if it changes
  if (JSON.stringify(items) !== JSON.stringify(groups) && !items.some(i => i.id.startsWith('temp'))) {
    // Check if lengths match to avoid resetting during drag
    if (items.length === groups.length) {
       // This is tricky with optimistic UI, but for now we'll trust props
       // Actually, let's just use props if we aren't dragging.
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-slate-700">
      <DndContext 
        id="dnd-groups"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((group) => (
            <SortableGroupItem key={group.id} group={group} />
          ))}
        </SortableContext>
      </DndContext>
      {items.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No categories found.
        </div>
      )}
    </div>
  )
}
