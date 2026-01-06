/**
 * isSystemBudget
 * 
 * Helper to check if a budget is the protected "To Be Budgeted" budget.
 * Use this in UI to disable "Delete" buttons.
 */
export function isSystemBudget(budgetName: string): boolean {
  return budgetName === 'To Be Budgeted'
}