import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer', 'budget_move'])

export type TransactionType = z.infer<typeof transactionTypeSchema>

const baseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  description: z.string().optional(),
})

export const expenseSchema = baseSchema.extend({
  type: z.literal('expense'),
  from_account_id: z.string().uuid('Account is required'),
  from_budget_id: z.string().uuid('Budget is required'),
})

export const incomeSchema = baseSchema.extend({
  type: z.literal('income'),
  to_account_id: z.string().uuid('Account is required'),
  to_budget_id: z.string().uuid('Budget is required'),
})

export const transferSchema = baseSchema.extend({
  type: z.literal('transfer'),
  from_account_id: z.string().uuid('Source account is required'),
  to_account_id: z.string().uuid('Destination account is required'),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: "Cannot transfer to the same account",
  path: ["to_account_id"],
})

export const budgetMoveSchema = baseSchema.extend({
  type: z.literal('budget_move'),
  from_budget_id: z.string().uuid('Source budget is required'),
  to_budget_id: z.string().uuid('Destination budget is required'),
}).refine((data) => data.from_budget_id !== data.to_budget_id, {
  message: "Cannot move to the same budget",
  path: ["to_budget_id"],
})

export const transactionSchema = z.discriminatedUnion('type', [
  expenseSchema,
  incomeSchema,
  transferSchema,
  budgetMoveSchema,
])

export type TransactionFormData = z.infer<typeof transactionSchema>
