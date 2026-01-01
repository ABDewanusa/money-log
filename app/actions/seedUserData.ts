'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * seedUserData
 * 
 * Idempotent server action to set up initial data for a new user.
 * 
 * Logic:
 * 1. Checks if the user is authenticated.
 * 2. Checks if default groups already exist.
 * 3. Creates "Needs", "Wants", "Savings" groups if missing.
 * 4. Checks if "To Be Budgeted" bucket exists.
 * 5. Creates "To Be Budgeted" bucket inside "Needs" (or a dedicated "System" group if we were strictly following schema, 
 *    but PRD allows simplification. We'll put it in "Needs" or create a "System" group if preferred. 
 *    Let's stick to the prompt: "System" group is often best for TBB).
 * 
 * Note: We are NOT changing schema. We are inserting rows.
 */
export async function seedUserData() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: Must be logged in to seed data.')
  }

  const userId = user.id

  // 2. Groups Setup
  // We want to ensure these groups exist:
  const defaultGroups = [
    { title: 'System', order: 0 }, // For "To Be Budgeted"
    { title: 'Needs', order: 10 },
    { title: 'Wants', order: 20 },
    { title: 'Savings', order: 30 },
  ]

  // Fetch existing groups to avoid duplicates (Idempotency)
  const { data: existingGroups, error: fetchGroupsError } = await supabase
    .from('groups')
    .select('title, id')
    .eq('user_id', userId)

  if (fetchGroupsError) throw new Error('Failed to fetch groups')

  const existingTitles = new Set(existingGroups?.map(g => g.title) || [])
  const groupsToInsert = defaultGroups
    .filter(g => !existingTitles.has(g.title))
    .map(g => ({
      user_id: userId,
      title: g.title,
      sort_order: g.order
    }))

  if (groupsToInsert.length > 0) {
    const { error: insertGroupsError } = await supabase
      .from('groups')
      .insert(groupsToInsert)
    
    if (insertGroupsError) throw new Error('Failed to create default groups')
  }

  // Refetch groups to get IDs (including newly created ones)
  const { data: allGroups } = await supabase
    .from('groups')
    .select('id, title')
    .eq('user_id', userId)

  const systemGroup = allGroups?.find(g => g.title === 'System')
  
  if (!systemGroup) {
     // Should not happen if insert worked, but safety check
     throw new Error('System group missing after seed attempt')
  }

  // 3. "To Be Budgeted" Bucket Setup
  // This is the critical system bucket.
  const TBB_NAME = 'To Be Budgeted'

  const { data: existingBuckets, error: fetchBucketsError } = await supabase
    .from('buckets')
    .select('name')
    .eq('user_id', userId)
    .eq('name', TBB_NAME)

  if (fetchBucketsError) throw new Error('Failed to fetch buckets')

  if (existingBuckets.length === 0) {
    // Create TBB Bucket
    const { error: insertTbbError } = await supabase
      .from('buckets')
      .insert({
        user_id: userId,
        group_id: systemGroup.id,
        name: TBB_NAME,
        target_amount: 0 // Not applicable for TBB
      })

    if (insertTbbError) throw new Error('Failed to create To Be Budgeted bucket')
  }

  // 4. Revalidate
  revalidatePath('/dashboard')
  
  return { success: true }
}

/**
 * isSystemBucket
 * 
 * Helper to check if a bucket is the protected "To Be Budgeted" bucket.
 * Use this in UI to disable "Delete" buttons.
 */
export function isSystemBucket(bucketName: string): boolean {
  return bucketName === 'To Be Budgeted'
}
