'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  if (!name || !type) return { error: 'Name and Type required' }

  const { error } = await supabase.from('accounts').insert({ 
    name, 
    type,
    user_id: (await supabase.auth.getUser()).data.user?.id 
  })
  
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  return { success: true }
}

export async function archiveAccount(formData: FormData) {
  const supabase = await createClient()
  const accountId = formData.get('account_id') as string
  
  if (!accountId) return { error: 'Account ID required' }

  const { error } = await supabase
    .from('accounts')
    .update({ is_archived: true })
    .eq('id', accountId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createBucket(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const group_id = formData.get('group_id') as string
  const target_str = formData.get('target_amount') as string
  
  const target_amount = target_str ? Math.round(parseFloat(target_str) * 100) : 0

  if (!name || !group_id) return { error: 'Name and Group required' }

  const { error } = await supabase.from('buckets').insert({ 
    name, 
    group_id, 
    target_amount,
    user_id: (await supabase.auth.getUser()).data.user?.id 
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateBucketGroup(formData: FormData) {
  const supabase = await createClient()
  const bucket_id = formData.get('bucket_id') as string
  const group_id = formData.get('group_id') as string

  if (!bucket_id || !group_id) return { error: 'Bucket and Group required' }

  const { error } = await supabase
    .from('buckets')
    .update({ group_id })
    .eq('id', bucket_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
