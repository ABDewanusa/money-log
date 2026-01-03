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
import { updateBucketOrder, archiveBucket, unarchiveBucket, deleteBucket } from '@/app/actions/settings'
import { formatMoney } from '@/utils/format/money'

type Bucket = {
  id: string
  name: string
  target_amount: number
  is_archived: boolean
  sort_order?: number
}

function SortableBucketItem({ bucket }: { bucket: Bucket }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: bucket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="p-3 sm:p-4 flex flex-row items-center justify-between bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 last:border-0 gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing px-1 flex-shrink-0">
          ⋮⋮
        </button>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium truncate ${bucket.is_archived ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
              {bucket.name}
            </span>
            {bucket.is_archived && (
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded flex-shrink-0">Archived</span>
            )}
          </div>
          {bucket.target_amount > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              Target: {formatMoney(bucket.target_amount)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
        {bucket.name !== 'To Be Budgeted' && (
          <>
            {!bucket.is_archived ? (
              <form action={archiveBucket}>
                <input type="hidden" name="bucket_id" value={bucket.id} />
                <button 
                  type="submit"
                  className="w-20 text-xs font-medium text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 px-3 py-1.5 rounded transition-colors"
                >
                  Archive
                </button>
              </form>
            ) : (
              <form action={unarchiveBucket}>
                <input type="hidden" name="bucket_id" value={bucket.id} />
                <button 
                  type="submit"
                  className="w-20 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded transition-colors"
                >
                  Unarchive
                </button>
              </form>
            )}
            <form action={deleteBucket}>
              <input type="hidden" name="bucket_id" value={bucket.id} />
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

export default function SortableBucketList({ buckets }: { buckets: Bucket[] }) {
  const id = useId()
  const [items, setItems] = useState(buckets)

  useEffect(() => {
    setItems(buckets.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  }, [buckets])

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
        
        updateBucketOrder(updates)
        
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
        <div className="divide-y divide-gray-200 dark:divide-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {items.map(bucket => (
            <SortableBucketItem key={bucket.id} bucket={bucket} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
