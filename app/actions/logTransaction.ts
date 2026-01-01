'use server'

import { createClient } from '@/utils/supabase/server'
import { transactionSchema, type TransactionFormData } from '@/app/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function logTransaction(data: TransactionFormData) {
  const supabase = await createClient()

  // 1. Validate Input
  const result = transactionSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const { type, amount, date, description } = result.data
  const amountInCents = Math.round(amount * 100)

  // 2. Prepare payload based on type
  let payload: any = {
    type,
    amount: amountInCents,
    date,
    description: description || null,
  }

  switch (type) {
    case 'expense':
      payload.from_account_id = result.data.from_account_id
      payload.from_bucket_id = result.data.from_bucket_id
      break
    case 'income':
      payload.to_account_id = result.data.to_account_id
      payload.to_bucket_id = result.data.to_bucket_id
      break
    case 'transfer':
      payload.from_account_id = result.data.from_account_id
      payload.to_account_id = result.data.to_account_id
      break
    case 'bucket_move':
      payload.from_bucket_id = result.data.from_bucket_id
      payload.to_bucket_id = result.data.to_bucket_id
      break
  }

  // 3. Insert into DB
  const { error } = await supabase.from('transactions').insert(payload)

  if (error) {
    console.error('Transaction Insert Error:', error)
    return { success: false, error: error.message }
  }

  // 4. Revalidate
  revalidatePath('/dashboard')
  return { success: true }
}
