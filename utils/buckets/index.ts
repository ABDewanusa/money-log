/**
 * isSystemBucket
 * 
 * Helper to check if a bucket is the protected "To Be Budgeted" bucket.
 * Use this in UI to disable "Delete" buttons.
 */
export function isSystemBucket(bucketName: string): boolean {
  return bucketName === 'To Be Budgeted'
}
