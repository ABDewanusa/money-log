import { createClient } from '@/utils/supabase/server'

export type AccountBalance = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'cash'
  balance: number
  sort_order?: number
}

export type BucketBalance = {
  id: string
  name: string
  group_id: string
  target_amount: number
  balance: number
  sort_order?: number
}

export type DashboardSummary = {
  total_cash: number
  total_budgeted: number
  unallocated_error_check: number
}

export type Group = {
  id: string
  title: string
  sort_order: number
}

export type Transaction = {
  id: string
  created_at: string
  date: string
  amount: number
  description: string | null
  type: 'income' | 'expense' | 'transfer' | 'bucket_move'
  from_account_id: string | null
  to_account_id: string | null
  from_bucket_id: string | null
  to_bucket_id: string | null
}

export type Account = {
  id: string
  name: string
  type: string
  is_archived: boolean
  sort_order?: number
}

export type Bucket = {
  id: string
  name: string
  group_id: string
  target_amount: number
  is_archived: boolean
  sort_order?: number
}

/**
 * Fetch all account balances for the current user.
 */
export async function getAccountBalances() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // 1. Get IDs of accounts that belong to this user
  const { data: userAccounts, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)

  if (accountError) {
    throw new Error(`Failed to fetch user accounts: ${accountError.message}`)
  }

  const accountIds = userAccounts.map(a => a.id)

  if (accountIds.length === 0) {
    return []
  }
  
  // 2. Filter the view by these IDs
  const { data, error } = await supabase
    .from('v_account_balances')
    .select('*')
    .in('id', accountIds)
    .order('sort_order')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch account balances: ${error.message}`)
  }

  // Deduplicate accounts by ID
  const uniqueAccounts = Array.from(new Map((data || []).map(a => [a.id, a])).values())

  return uniqueAccounts as AccountBalance[]
}

/**
 * Fetch all bucket balances for the current user.
 */
export async function getBucketBalances() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // 1. Get IDs of buckets that belong to this user
  const { data: userBuckets, error: bucketError } = await supabase
    .from('buckets')
    .select('id')
    .eq('user_id', user.id)

  if (bucketError) {
    throw new Error(`Failed to fetch user buckets: ${bucketError.message}`)
  }

  const bucketIds = userBuckets.map(b => b.id)

  if (bucketIds.length === 0) {
    return []
  }
  
  // 2. Filter the view by these IDs
  const { data, error } = await supabase
    .from('v_bucket_balances')
    .select('*')
    .in('id', bucketIds)
    .order('sort_order')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch bucket balances: ${error.message}`)
  }

  // Deduplicate buckets by ID to prevent React key errors if the view returns duplicates
  const uniqueBuckets = Array.from(new Map((data || []).map(b => [b.id, b])).values())

  return uniqueBuckets as BucketBalance[]
}

/**
 * Fetch groups to organize buckets.
 */
export async function getGroups() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []
  
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch groups: ${error.message}`)
  }

  // Deduplicate groups by ID
  const uniqueGroups = Array.from(new Map((data || []).map(g => [g.id, g])).values())

  return uniqueGroups as Group[]
}

/**
 * Fetch recent transactions.
 */
export async function getRecentTransactions(limit = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data as Transaction[]
}

/**
 * Fetch all accounts (raw).
 */
export async function getAccounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase.from('accounts').select('*').eq('user_id', user.id).order('sort_order').order('name')
  if (error) throw new Error(`Failed to fetch accounts: ${error.message}`)
  return data as Account[]
}

/**
 * Fetch all buckets (raw).
 */
export async function getBuckets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase.from('buckets').select('*').eq('user_id', user.id).order('sort_order').order('name')
  if (error) throw new Error(`Failed to fetch buckets: ${error.message}`)
  return data as Bucket[]
}
