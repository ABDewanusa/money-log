import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer', 'bucket_move'])

export type TransactionType = z.infer<typeof transactionTypeSchema>

const baseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  description: z.string().optional(),
})

export const expenseSchema = baseSchema.extend({
  type: z.literal('expense'),
  from_account_id: z.string().uuid('Account is required'),
  from_bucket_id: z.string().uuid('Bucket is required'),
})

export const incomeSchema = baseSchema.extend({
  type: z.literal('income'),
  to_account_id: z.string().uuid('Account is required'),
  to_bucket_id: z.string().uuid('Bucket is required'),
})

export const transferSchema = baseSchema.extend({
  type: z.literal('transfer'),
  from_account_id: z.string().uuid('Source account is required'),
  to_account_id: z.string().uuid('Destination account is required'),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: "Cannot transfer to the same account",
  path: ["to_account_id"],
})

export const bucketMoveSchema = baseSchema.extend({
  type: z.literal('bucket_move'),
  from_bucket_id: z.string().uuid('Source bucket is required'),
  to_bucket_id: z.string().uuid('Destination bucket is required'),
}).refine((data) => data.from_bucket_id !== data.to_bucket_id, {
  message: "Cannot move to the same bucket",
  path: ["to_bucket_id"],
})

export const transactionSchema = z.discriminatedUnion('type', [
  expenseSchema,
  incomeSchema,
  transferSchema,
  bucketMoveSchema,
])

export type TransactionFormData = z.infer<typeof transactionSchema>
