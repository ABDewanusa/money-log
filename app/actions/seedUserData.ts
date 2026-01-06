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
 * 4. Checks if "To Be Budgeted" budget exists.
 * 5. Creates "To Be Budgeted" budget inside "Needs" (or a dedicated "System" group if we were strictly following schema, 
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

  // 2. Categories Setup
  // Enhanced Seeding: Create specific categories mapped to core types
  const defaultGroups = [
    { title: 'System', type: null, order: 0 }, // For "To Be Budgeted"
    // Needs
    { title: 'Housing', type: 'need', order: 10 },
    { title: 'Food', type: 'need', order: 11 },
    { title: 'Transportation', type: 'need', order: 12 },
    { title: 'Utilities', type: 'need', order: 13 },
    // Wants
    { title: 'Entertainment', type: 'want', order: 20 },
    { title: 'Shopping', type: 'want', order: 21 },
    // Savings
    { title: 'Emergency Fund', type: 'savings', order: 30 },
    { title: 'Goals', type: 'savings', order: 31 },
  ]

  // Fetch existing categories to avoid duplicates (Idempotency)
  const { data: existingGroups, error: fetchGroupsError } = await supabase
    .from('categories')
    .select('title, id')
    .eq('user_id', userId)

  if (fetchGroupsError) throw new Error('Failed to fetch groups')

  const existingTitles = new Set(existingGroups?.map(g => g.title) || [])
  const groupsToInsert = defaultGroups
    .filter(g => !existingTitles.has(g.title))
    .map(g => ({
      user_id: userId,
      title: g.title,
      type: g.type,
      sort_order: g.order
    }))

  if (groupsToInsert.length > 0) {
    const { error: insertGroupsError } = await supabase
      .from('categories')
      .insert(groupsToInsert)
    
    if (insertGroupsError) {
       // Fallback for existing users who haven't run the migration yet (ignore type)
       console.warn('Failed to insert with type, trying without type (backward compatibility)', insertGroupsError)
       const legacyGroups = groupsToInsert.map(({ type, ...rest }) => rest)
       await supabase.from('categories').insert(legacyGroups)
    }
  }

  // Refetch categories to get IDs (including newly created ones)
  const { data: allGroups } = await supabase
    .from('categories')
    .select('id, title')
    .eq('user_id', userId)

  const systemGroup = allGroups?.find(g => g.title === 'System')
  
  if (!systemGroup) {
     // Should not happen if insert worked, but safety check
     throw new Error('System group missing after seed attempt')
  }

  // 3. "To Be Budgeted" Budget Setup
  // This is the critical system budget.
  const TBB_NAME = 'To Be Budgeted'

  const { data: existingBudgets, error: fetchBudgetsError } = await supabase
    .from('budgets')
    .select('name')
    .eq('user_id', userId)
    .eq('name', TBB_NAME)

  if (fetchBudgetsError) throw new Error('Failed to fetch budgets')

  if (existingBudgets.length === 0) {
    // Create TBB Budget
    const { error: insertTbbError } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: systemGroup.id,
        name: TBB_NAME,
        target_amount: 0 // Not applicable for TBB
      })

    if (insertTbbError) throw new Error('Failed to create To Be Budgeted budget')
  }

  // 4. Revalidate
  revalidatePath('/dashboard')
  
  return { success: true }
}
