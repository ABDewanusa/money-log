-- 1. Rename table
ALTER TABLE buckets RENAME TO budgets;

-- 2. Rename columns in transactions
ALTER TABLE transactions RENAME COLUMN from_bucket_id TO from_budget_id;
ALTER TABLE transactions RENAME COLUMN to_bucket_id TO to_budget_id;

-- 3. Rename enum value
-- Note: 'bucket_move' becomes 'budget_move'
ALTER TYPE transaction_type RENAME VALUE 'bucket_move' TO 'budget_move';

-- 4. Drop old views that depend on the old table/columns
DROP VIEW IF EXISTS v_dashboard_summary;
DROP VIEW IF EXISTS v_bucket_balances;

-- 5. Recreate v_budget_balances (replacing v_bucket_balances)
CREATE OR REPLACE VIEW v_budget_balances AS
SELECT 
  b.id,
  b.name,
  b.group_id,
  b.target_amount,
  b.sort_order,
  COALESCE(SUM(CASE WHEN t.to_budget_id = b.id THEN t.amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN t.from_budget_id = b.id THEN t.amount ELSE 0 END), 0) AS balance
FROM budgets b
LEFT JOIN transactions t ON t.to_budget_id = b.id OR t.from_budget_id = b.id
GROUP BY b.id, b.name, b.group_id, b.target_amount, b.sort_order;

-- 6. Recreate v_dashboard_summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
  (SELECT SUM(balance) FROM v_account_balances) AS total_cash,
  (SELECT SUM(balance) FROM v_budget_balances) AS total_budgeted,
  (SELECT SUM(balance) FROM v_account_balances) - (SELECT SUM(balance) FROM v_budget_balances) AS unallocated_error_check;

-- 7. Update Constraints
-- We drop old constraints and create new ones with updated column references and check logic.
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS valid_expense;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS valid_income;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS valid_bucket_move;

ALTER TABLE transactions ADD CONSTRAINT valid_expense CHECK (
    (type = 'expense' AND from_account_id IS NOT NULL AND from_budget_id IS NOT NULL) OR
    (type != 'expense')
);

ALTER TABLE transactions ADD CONSTRAINT valid_income CHECK (
    (type = 'income' AND to_account_id IS NOT NULL AND to_budget_id IS NOT NULL) OR
    (type != 'income')
);

ALTER TABLE transactions ADD CONSTRAINT valid_budget_move CHECK (
    (type = 'budget_move' AND from_budget_id IS NOT NULL AND to_budget_id IS NOT NULL) OR
    (type != 'budget_move')
);
