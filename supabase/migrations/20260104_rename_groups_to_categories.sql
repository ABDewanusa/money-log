-- 1. Drop views that depend on the tables/columns we are about to rename
DROP VIEW IF EXISTS v_dashboard_summary;
DROP VIEW IF EXISTS v_budget_balances;

-- 2. Rename table groups to categories
ALTER TABLE groups RENAME TO categories;

-- 3. Rename columns in budgets table
ALTER TABLE budgets RENAME COLUMN group_id TO category_id;

-- 4. Recreate v_budget_balances with updated column names
CREATE OR REPLACE VIEW v_budget_balances AS
SELECT 
  b.id,
  b.name,
  b.category_id,
  b.target_amount,
  b.sort_order,
  COALESCE(SUM(CASE WHEN t.to_budget_id = b.id THEN t.amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN t.from_budget_id = b.id THEN t.amount ELSE 0 END), 0) AS balance
FROM budgets b
LEFT JOIN transactions t ON t.to_budget_id = b.id OR t.from_budget_id = b.id
GROUP BY b.id, b.name, b.category_id, b.target_amount, b.sort_order;

-- 5. Recreate v_dashboard_summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
  (SELECT SUM(balance) FROM v_account_balances) AS total_cash,
  (SELECT SUM(balance) FROM v_budget_balances) AS total_budgeted,
  (SELECT SUM(balance) FROM v_account_balances) - (SELECT SUM(balance) FROM v_budget_balances) AS unallocated_error_check;
