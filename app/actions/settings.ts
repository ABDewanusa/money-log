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
