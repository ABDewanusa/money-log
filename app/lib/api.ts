import { createClient } from '@/utils/supabase/server'

export type AccountBalance = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'cash'
  balance: number
  sort_order?: number
}

export type BudgetBalance = {
  id: string
  name: string
  category_id: string
  target_amount: number
  balance: number
  sort_order?: number
}

export type DashboardSummary = {
  total_cash: number
  total_budgeted: number
  unallocated_error_check: number
}

export type Category = {
  id: string
  title: string
  type?: 'need' | 'want' | 'savings' | null
  sort_order: number
}

export type Transaction = {
  id: string
  created_at: string
  date: string
  amount: number
  description: string | null
  type: 'income' | 'expense' | 'transfer' | 'budget_move'
  from_account_id: string | null
  to_account_id: string | null
  from_budget_id: string | null
  to_budget_id: string | null
}

export type Account = {
  id: string
  name: string
  type: string
  is_archived: boolean
  sort_order?: number
  created_at: string
}

export type Budget = {
  id: string
  name: string
  category_id: string
  target_amount: number
  is_archived: boolean
  sort_order?: number
  created_at: string
}

export type MonthlyStats = {
  total_income: number
  total_expenses: number
  net_savings: number
  expenses_by_category: {
    category_id: string
    category_name: string
    amount: number
    type: 'need' | 'want' | 'savings' | 'uncategorized'
  }[]
  expenses_by_type: {
    type: 'need' | 'want' | 'savings' | 'uncategorized'
    amount: number
  }[]
}

export type YearlyStats = {
  total_income: number
  total_expenses: number
  net_savings: number
  average_monthly_expenses: number
  monthly_breakdown: {
    month: number // 0-11
    income: number
    expenses: number
    net: number
  }[]
}

/**
 * Fetch monthly statistics for a given month and year.
 */
export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Calculate start and end dates for the month
  const startDate = new Date(year, month, 1).toISOString()
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString()

  // 1. Fetch transactions for the month
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (txError) {
    throw new Error(`Failed to fetch transactions: ${txError.message}`)
  }

  // 2. Fetch all categories and budgets for categorization
  const [categories, budgets] = await Promise.all([
    getCategories(),
    getBudgets()
  ])

  // Create lookups
  const budgetCategoryMap = new Map(budgets.map(b => [b.id, b.category_id]))
  const categoryNameMap = new Map(categories.map(c => [c.id, c.title]))
  const categoryTypeMap = new Map(categories.map(c => [c.id, c.type]))

  // 3. Aggregate data
  let total_income = 0
  let total_expenses = 0
  const expenses_by_category_map = new Map<string, number>()
  const expenses_by_type_map = new Map<string, number>()

  transactions?.forEach(tx => {
    if (tx.type === 'income') {
      total_income += tx.amount
    } else if (tx.type === 'expense') {
      total_expenses += tx.amount
      
      // Categorize by category
      if (tx.from_budget_id) {
        const categoryId = budgetCategoryMap.get(tx.from_budget_id)
        if (categoryId) {
          const current = expenses_by_category_map.get(categoryId) || 0
          expenses_by_category_map.set(categoryId, current + tx.amount)

          const type = categoryTypeMap.get(categoryId) || 'uncategorized'
          const currentType = expenses_by_type_map.get(type) || 0
          expenses_by_type_map.set(type, currentType + tx.amount)
        } else {
           const current = expenses_by_category_map.get('uncategorized') || 0
           expenses_by_category_map.set('uncategorized', current + tx.amount)

           const currentType = expenses_by_type_map.get('uncategorized') || 0
           expenses_by_type_map.set('uncategorized', currentType + tx.amount)
        }
      }
    }
  })

  // Format category breakdown
  const expenses_by_category = Array.from(expenses_by_category_map.entries()).map(([categoryId, amount]) => {
    if (categoryId === 'uncategorized') {
      return { 
        category_id: 'uncategorized', 
        category_name: 'Uncategorized', 
        amount,
        type: 'uncategorized' as const
      }
    }
    return {
      category_id: categoryId,
      category_name: categoryNameMap.get(categoryId) || 'Unknown Category',
      amount,
      type: (categoryTypeMap.get(categoryId) || 'uncategorized') as 'need' | 'want' | 'savings' | 'uncategorized'
    }
  }).sort((a, b) => b.amount - a.amount)

  // Format type breakdown
  const expenses_by_type = Array.from(expenses_by_type_map.entries()).map(([type, amount]) => ({
    type: type as 'need' | 'want' | 'savings' | 'uncategorized',
    amount
  })).sort((a, b) => b.amount - a.amount)

  return {
    total_income,
    total_expenses,
    net_savings: total_income - total_expenses,
    expenses_by_category,
    expenses_by_type
  }
}

/**
 * Fetch yearly statistics for a given year.
 */
export async function getYearlyStats(year: number): Promise<YearlyStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const startDate = new Date(year, 0, 1).toISOString()
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString()

  // 1. Fetch transactions for the year
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (txError) {
    throw new Error(`Failed to fetch transactions: ${txError.message}`)
  }

  // 2. Aggregate by month
  let total_income = 0
  let total_expenses = 0
  const monthly_data = new Array(12).fill(0).map((_, i) => ({
    month: i,
    income: 0,
    expenses: 0,
    net: 0
  }))

  transactions?.forEach(tx => {
    const month = new Date(tx.date).getMonth()
    
    if (tx.type === 'income') {
      total_income += tx.amount
      monthly_data[month].income += tx.amount
    } else if (tx.type === 'expense') {
      total_expenses += tx.amount
      monthly_data[month].expenses += tx.amount
    }
  })

  // Calculate nets
  monthly_data.forEach(m => {
    m.net = m.income - m.expenses
  })

  // Calculate average monthly expenses (divide by current month + 1 if current year, else 12)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  let divisor = 12
  
  if (year === currentYear) {
    divisor = currentMonth + 1
  }

  const average_monthly_expenses = total_expenses / divisor

  return {
    total_income,
    total_expenses,
    net_savings: total_income - total_expenses,
    average_monthly_expenses,
    monthly_breakdown: monthly_data
  }
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
 * Fetch all budget balances for the current user.
 */
export async function getBudgetBalances() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // 1. Get IDs of budgets that belong to this user
  const { data: userBudgets, error: budgetError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)

  if (budgetError) {
    throw new Error(`Failed to fetch user budgets: ${budgetError.message}`)
  }

  const budgetIds = userBudgets.map(b => b.id)

  if (budgetIds.length === 0) {
    return []
  }
  
  // 2. Filter the view by these IDs
  const { data, error } = await supabase
    .from('v_budget_balances')
    .select('*')
    .in('id', budgetIds)
    .order('sort_order')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch budget balances: ${error.message}`)
  }

  // Deduplicate budgets by ID to prevent React key errors if the view returns duplicates
  const uniqueBudgets = Array.from(new Map((data || []).map(b => [b.id, b])).values())

  return uniqueBudgets as BudgetBalance[]
}

/**
 * Fetch categories to organize budgets.
 */
export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  const uniqueCategories = Array.from(new Map((data || []).map(c => [c.id, c])).values())

  return uniqueCategories as Category[]
}

/**
 * Fetch recent transactions.
 */
export async function getRecentTransactions(limit = 30, type?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data, error } = await query

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
 * Fetch all budgets (raw).
 */
export async function getBudgets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase.from('budgets').select('*').eq('user_id', user.id).order('sort_order').order('name')
  if (error) throw new Error(`Failed to fetch budgets: ${error.message}`)
  return data as Budget[]
}
