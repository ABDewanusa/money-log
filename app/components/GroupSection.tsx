import { formatMoney } from '@/utils/format/money'
import { isSystemBucket } from '@/utils/buckets'
import { BucketBalance, Group } from '@/app/lib/api'

type Props = {
  group: Group & { buckets: BucketBalance[] }
}

export function GroupSection({ group }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end border-b pb-1">
        <h3 className="font-semibold text-gray-800">{group.title}</h3>
        <span className="text-xs text-gray-400 mb-1">Order: {group.sort_order}</span>
      </div>

      {group.buckets.length === 0 ? (
        <p className="text-sm text-gray-400 italic pl-2">No buckets</p>
      ) : (
        <div className="space-y-2">
          {group.buckets.map((bucket) => (
            <div
              key={bucket.id}
              className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{bucket.name}</span>
                  {isSystemBucket(bucket.name) && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      System
                    </span>
                  )}
                </div>
                {bucket.target_amount > 0 && (
                  <span className="text-xs text-gray-400">
                    Goal: {formatMoney(bucket.target_amount)}
                  </span>
                )}
              </div>
              
              <div className={`font-mono font-medium ${bucket.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatMoney(bucket.balance)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
