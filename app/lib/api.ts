import { createClient } from '@/utils/supabase/server'

export type AccountBalance = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'cash'
  balance: number
}

export type BucketBalance = {
  id: string
  name: string
  group_id: string
  target_amount: number
  balance: number
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
}

export type Bucket = {
  id: string
  name: string
  group_id: string
  target_amount: number
  is_archived: boolean
}

/**
 * Fetch all account balances for the current user.
 */
export async function getAccountBalances() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('v_account_balances')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch account balances: ${error.message}`)
  }

  return data as AccountBalance[]
}

/**
 * Fetch all bucket balances for the current user.
 */
export async function getBucketBalances() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('v_bucket_balances')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch bucket balances: ${error.message}`)
  }

  return data as BucketBalance[]
}

/**
 * Fetch the high-level dashboard summary (totals).
 */
export async function getDashboardSummary() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('v_dashboard_summary')
    .select('*')
    .single()

  if (error) {
    // If the view returns no rows (e.g. no data at all), it might be an error or just null
    // But typically an aggregate view returns one row with nulls if empty.
    // If it's a real error (like 404/500), throw.
    if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
       return { total_cash: 0, total_budgeted: 0, unallocated_error_check: 0 }
    }
    throw new Error(`Failed to fetch dashboard summary: ${error.message}`)
  }

  return {
    total_cash: data.total_cash ?? 0,
    total_budgeted: data.total_budgeted ?? 0,
    unallocated_error_check: data.unallocated_error_check ?? 0
  } as DashboardSummary
}

/**
 * Fetch groups to organize buckets.
 */
export async function getGroups() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch groups: ${error.message}`)
  }

  return data as Group[]
}

/**
 * Fetch recent transactions.
 */
export async function getRecentTransactions(limit = 30) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
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
  const { data, error } = await supabase.from('accounts').select('*').order('name')
  if (error) throw new Error(`Failed to fetch accounts: ${error.message}`)
  return data as Account[]
}

/**
 * Fetch all buckets (raw).
 */
export async function getBuckets() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('buckets').select('*').order('name')
  if (error) throw new Error(`Failed to fetch buckets: ${error.message}`)
  return data as Bucket[]
}
