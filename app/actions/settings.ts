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

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const type = formData.get('type') as string
  
  if (!title) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get max sort order
  const { data: existingGroups } = await supabase
    .from('groups')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existingGroups?.[0]?.sort_order || 0) + 10

  const { error } = await supabase.from('groups').insert({
    title,
    type: type || null,
    user_id: user.id,
    sort_order: nextOrder
  })

  if (error) {
    console.error('Create Group Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateGroup(formData: FormData) {
  const supabase = await createClient()
  const groupId = formData.get('group_id') as string
  const title = formData.get('title') as string
  const type = formData.get('type') as string

  if (!groupId || !title) return

  const { error } = await supabase
    .from('groups')
    .update({ 
      title,
      type: type || null
    })
    .eq('id', groupId)

  if (error) {
    console.error('Update Group Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function deleteGroup(formData: FormData) {
  const supabase = await createClient()
  const groupId = formData.get('group_id') as string

  if (!groupId) return

  // Check if group has buckets
  const { count, error: countError } = await supabase
    .from('buckets')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  if (countError) {
    console.error('Check Buckets Error:', countError)
    return
  }

  if (count && count > 0) {
    // Cannot delete group with buckets
    // In a real app, we should return an error to the UI
    console.error('Cannot delete group with buckets')
    return
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('Delete Group Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateGroupOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()

  for (const item of items) {
    await supabase.from('groups').update({ sort_order: item.sort_order }).eq('id', item.id)
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

export async function updateBucketOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()

  for (const item of items) {
    await supabase.from('buckets').update({ sort_order: item.sort_order }).eq('id', item.id)
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

export async function archiveBucket(formData: FormData) {
  const supabase = await createClient()
  const bucketId = formData.get('bucket_id') as string

  if (!bucketId) return

  // Check if TBB
  const { data: bucket } = await supabase.from('buckets').select('name').eq('id', bucketId).single()
  if (bucket?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('buckets')
    .update({ is_archived: true })
    .eq('id', bucketId)

  if (error) {
    console.error('Archive Bucket Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function unarchiveBucket(formData: FormData) {
  const supabase = await createClient()
  const bucketId = formData.get('bucket_id') as string

  if (!bucketId) return

  // Check if TBB (though unarchiving TBB shouldn't happen if it can't be archived, adding for safety)
  const { data: bucket } = await supabase.from('buckets').select('name').eq('id', bucketId).single()
  if (bucket?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('buckets')
    .update({ is_archived: false })
    .eq('id', bucketId)

  if (error) {
    console.error('Unarchive Bucket Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function deleteBucket(formData: FormData) {
  const supabase = await createClient()
  const bucketId = formData.get('bucket_id') as string

  if (!bucketId) return

  // Check if TBB
  const { data: bucket } = await supabase.from('buckets').select('name').eq('id', bucketId).single()
  if (bucket?.name === 'To Be Budgeted') return

  const { error } = await supabase
    .from('buckets')
    .delete()
    .eq('id', bucketId)
  
  if (error) {
    console.error('Delete Bucket Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function createBucket(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const group_id = formData.get('group_id') as string
  const target_str = formData.get('target_amount') as string
  
  const target_amount = target_str ? Math.round(parseFloat(target_str) * 100) : 0

  if (!name || !group_id) return

  // Prevent creating "To Be Budgeted" manually
  if (name.trim().toLowerCase() === 'to be budgeted') {
    return
  }

  // Prevent creating buckets in "System" group
  const { data: group } = await supabase.from('groups').select('title').eq('id', group_id).single()
  if (group?.title === 'System') {
    return
  }

  const { error } = await supabase.from('buckets').insert({ 
    name, 
    group_id, 
    target_amount,
    user_id: (await supabase.auth.getUser()).data.user?.id 
  })

  if (error) {
    console.error('Create Bucket Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBucketGroup(formData: FormData) {
  const supabase = await createClient()
  const bucket_id = formData.get('bucket_id') as string
  const group_id = formData.get('group_id') as string

  if (!bucket_id || !group_id) return

  const { error } = await supabase
    .from('buckets')
    .update({ group_id })
    .eq('id', bucket_id)

  if (error) {
    console.error('Update Bucket Group Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBucketTarget(formData: FormData) {
  const supabase = await createClient()
  const bucketId = formData.get('bucket_id') as string
  const targetStr = formData.get('target_amount') as string

  if (!bucketId) return

  const target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0

  const { error } = await supabase
    .from('buckets')
    .update({ target_amount })
    .eq('id', bucketId)

  if (error) {
    console.error('Update Bucket Target Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function updateBucket(formData: FormData) {
  const supabase = await createClient()
  const bucketId = formData.get('bucket_id') as string
  const name = formData.get('name') as string
  const targetStr = formData.get('target_amount') as string
  const groupId = formData.get('group_id') as string

  if (!bucketId) return

  const updates: any = {}
  if (name) updates.name = name
  if (targetStr !== null && targetStr !== undefined) {
    updates.target_amount = targetStr ? Math.round(parseFloat(targetStr) * 100) : 0
  }
  if (groupId) updates.group_id = groupId

  const { error } = await supabase
    .from('buckets')
    .update(updates)
    .eq('id', bucketId)

  if (error) {
    console.error('Update Bucket Error:', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}
