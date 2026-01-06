'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  if (!name || !type) {
    // return { error: 'Name and Type required' }
    return
  }

  const { error } = await supabase.from('accounts').insert({ 
    name, 
    type,
    user_id: (await supabase.auth.getUser()).data.user?.id 
  })
  
  if (error) {
    // return { error: error.message }
    console.error('Create Account Error:', error)
    return
  }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  // return { success: true }
}

export async function archiveAccount(formData: FormData) {
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  
  if (!accountId) return

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: true })
    .eq('id', accountId)
  
  if (error) {
    console.error('Archive Account Error:', error)
    return
  }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const type = formData.get('type') as string
  
  if (!title) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get max sort order
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existingCategories?.[0]?.sort_order || 0) + 10

  const { error } = await supabase.from('categories').insert({
    title,
    type: type || null,
    user_id: user.id,
    sort_order: nextOrder
  })

  if (error) {
    console.error('Create Category Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient()
  const categoryId = formData.get('category_id') as string
  const title = formData.get('title') as string
  const type = formData.get('type') as string

  if (!categoryId || !title) return

  const { error } = await supabase
    .from('categories')
    .update({ 
      title,
      type: type || null
    })
    .eq('id', categoryId)

  if (error) {
    console.error('Update Category Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const categoryId = formData.get('category_id') as string

  if (!categoryId) return

  // Check if category has budgets
  const { count, error: countError } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (countError) {
    console.error('Check Budgets Error:', countError)
    return
  }

  if (count && count > 0) {
    // Cannot delete category with budgets
    // In a real app, we should return an error to the UI
    console.error('Cannot delete category with budgets')
    return
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Delete Category Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateCategoryOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()

  for (const item of items) {
    await supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id)
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateAccountType(formData: FormData) {
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  const type = formData.get('type') as string

  if (!accountId || !type) return

  const { error } = await supabase
    .from('accounts')
    .update({ type })
    .eq('id', accountId)

  if (error) {
    console.error('Update Account Type Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateAccountOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()
  
  for (const item of items) {
    await supabase.from('accounts').update({ sort_order: item.sort_order }).eq('id', item.id)
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBudgetOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()

  for (const item of items) {
    await supabase.from('budgets').update({ sort_order: item.sort_order }).eq('id', item.id)
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function unarchiveAccount(formData: FormData) {
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  
  if (!accountId) return

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: false })
    .eq('id', accountId)
  
  if (error) {
    console.error('Unarchive Account Error:', error)
    return
  }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  
  if (!accountId) return

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
  
  if (error) {
    console.error('Delete Account Error:', error)
    return
  }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function archiveBudget(formData: FormData) {
  const supabase = await createClient()
  const budgetId = formData.get('budget_id') as string

  if (!budgetId) return

  // Check if TBB
  const { data: budget } = await supabase.from('budgets').select('name').eq('id', budgetId).single()
  if (budget?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('budgets')
    .update({ is_archived: true })
    .eq('id', budgetId)

  if (error) {
    console.error('Archive Budget Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function unarchiveBudget(formData: FormData) {
  const supabase = await createClient()
  const budgetId = formData.get('budget_id') as string

  if (!budgetId) return

  // Check if TBB (though unarchiving TBB shouldn't happen if it can't be archived, adding for safety)
  const { data: budget } = await supabase.from('budgets').select('name').eq('id', budgetId).single()
  if (budget?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('budgets')
    .update({ is_archived: false })
    .eq('id', budgetId)

  if (error) {
    console.error('Unarchive Budget Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function deleteBudget(formData: FormData) {
  const supabase = await createClient()
  const budgetId = formData.get('budget_id') as string

  if (!budgetId) return

  // Check if TBB
  const { data: budget } = await supabase.from('budgets').select('name').eq('id', budgetId).single()
  if (budget?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)
  
  if (error) {
    console.error('Delete Budget Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function createBudget(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const target_str = formData.get('target_amount') as string
  
  const target_amount = target_str ? Math.round(parseFloat(target_str) * 100) : 0

  if (!name || !category_id) return

  // Prevent creating "To Be Budgeted" manually
  if (name.trim().toLowerCase() === 'to be budgeted') {
    return
  }

  // Prevent creating budgets in "System" category
  const { data: category } = await supabase.from('categories').select('title').eq('id', category_id).single()
  if (category?.title === 'System') {
    return
  }

  const { error } = await supabase.from('budgets').insert({ 
    name, 
    category_id, 
    target_amount,
    user_id: (await supabase.auth.getUser()).data.user?.id 
  })

  if (error) {
    console.error('Create Budget Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBudgetCategory(formData: FormData) {
  const supabase = await createClient()
  const budget_id = formData.get('budget_id') as string
  const category_id = formData.get('category_id') as string

  if (!budget_id || !category_id) return

  const { error } = await supabase
    .from('budgets')
    .update({ category_id })
    .eq('id', budget_id)

  if (error) {
    console.error('Update Budget Category Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBudgetTarget(formData: FormData) {
  const supabase = await createClient()
  const budgetId = formData.get('budget_id') as string
  const targetStr = formData.get('target_amount') as string

  if (!budgetId) return

  const target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0

  const { error } = await supabase
    .from('budgets')
    .update({ target_amount })
    .eq('id', budgetId)

  if (error) {
    console.error('Update Budget Target Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBudget(formData: FormData) {
  const supabase = await createClient()
  const budgetId = formData.get('budget_id') as string
  const name = formData.get('name') as string
  const targetStr = formData.get('target_amount') as string
  const categoryId = formData.get('category_id') as string

  if (!budgetId) return

  const updates: any = {}
  if (name) updates.name = name
  if (targetStr !== null && targetStr !== undefined) {
    updates.target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0
  }
  if (categoryId) updates.category_id = categoryId

  const { error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', budgetId)

  if (error) {
    console.error('Update Budget Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}
