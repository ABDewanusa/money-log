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
    <div ref={setNodeRef} style={style} className="p-4 flex items-center justify-between bg-white border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        {/* Drag Handle */}
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1">
          ⋮⋮
        </button>
        
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${bucket.is_archived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {bucket.name}
            </span>
            {bucket.is_archived && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Archived</span>
            )}
          </div>
          {bucket.target_amount > 0 && (
            <div className="text-xs text-gray-500">
              Target: {formatMoney(bucket.target_amount)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {bucket.name !== 'To Be Budgeted' && (
          <>
            {!bucket.is_archived ? (
              <form action={archiveBucket}>
                <input type="hidden" name="bucket_id" value={bucket.id} />
                <button 
                  type="submit"
                  className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 px-2 py-1 rounded hover:bg-orange-50"
                >
                  Archive
                </button>
              </form>
            ) : (
              <form action={unarchiveBucket}>
                <input type="hidden" name="bucket_id" value={bucket.id} />
                <button 
                  type="submit"
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Unarchive
                </button>
              </form>
            )}
            <form action={deleteBucket}>
              <input type="hidden" name="bucket_id" value={bucket.id} />
              <button 
                type="submit"
                className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
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
        <div className="divide-y divide-gray-100">
          {items.map(bucket => (
            <SortableBucketItem key={bucket.id} bucket={bucket} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
