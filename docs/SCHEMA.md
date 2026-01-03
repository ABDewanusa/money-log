# Database Schema Design: Money Log MVP

## 1. Overview
This schema is designed for Supabase (PostgreSQL). It prioritizes **correctness** over convenience, using a double-entry philosophy adapted for a single table.

**Core Principles:**
*   **Transactions are immutable history.** We do not store "current balance" on the Account table. We calculate it.
*   **Zero-Sum:** Every transaction must explain where money came from and where it went.
*   **Integer Math:** All currency is stored in **cents** (integer) to avoid floating point errors. `$10.50` -> `1050`.

## 2. Table Definitions

### `accounts`
Represents physical locations of money (Banks, Wallets).

```sql
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'credit_card', 'cash')),
  sort_order integer default 0,
  is_archived boolean default false,
  created_at timestamptz default now()
);
```

### `groups`
High-level strategy containers for organization.

```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);
```

### `buckets`
The specific categories where money is "enveloped".

```sql
create table buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  target_amount bigint default 0, -- Optional target/goal in cents
  sort_order integer default 0,
  is_archived boolean default false,
  created_at timestamptz default now()
);
```

### `transactions`
The Single Source of Truth.
This table uses a "From/To" model to handle all 4 transaction types in one structure.

```sql
create type transaction_type as enum ('income', 'expense', 'transfer', 'bucket_move');

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  date date not null default current_date,
  amount bigint not null check (amount > 0), -- Always positive, direction handled by columns
  payee text,
  description text,
  type transaction_type not null,
  
  -- Movement Logic
  from_account_id uuid references accounts(id),
  to_account_id uuid references accounts(id),
  from_bucket_id uuid references buckets(id),
  to_bucket_id uuid references buckets(id),
  
  -- Constraints to enforce logic
  constraint valid_expense check (
    (type = 'expense' and from_account_id is not null and from_bucket_id is not null) or
    (type != 'expense')
  ),
  constraint valid_income check (
    (type = 'income' and to_account_id is not null and to_bucket_id is not null) or
    (type != 'income')
  ),
  constraint valid_transfer check (
    (type = 'transfer' and from_account_id is not null and to_account_id is not null) or
    (type != 'transfer')
  ),
  constraint valid_bucket_move check (
    (type = 'bucket_move' and from_bucket_id is not null and to_bucket_id is not null) or
    (type != 'bucket_move')
  )
);
```

## 3. Transaction Modeling Rules

| User Action | Type | Amount | From Account | To Account | From Bucket | To Bucket | Net Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pay Rent** | `expense` | 150000 | Checking | null | Rent | null | Checking -$1500, Rent -$1500 |
| **Salary** | `income` | 300000 | null | Checking | null | To Be Budgeted | Checking +$3000, TBB +$3000 |
| **CC Payment** | `transfer` | 50000 | Checking | Credit Card | null | null | Checking -$500, CC +$500 |
| **Cover Overspending** | `bucket_move` | 2000 | null | null | Dining Out | Groceries | Dining -$20, Groceries +$20 |

## 4. Derived Views

### `v_account_balances`
Calculates the current balance of every account.

```sql
create view v_account_balances as
select 
  a.id,
  a.name,
  a.type,
  a.sort_order,
  coalesce(sum(case when t.to_account_id = a.id then t.amount else 0 end), 0) -
  coalesce(sum(case when t.from_account_id = a.id then t.amount else 0 end), 0) as balance
from accounts a
left join transactions t on t.to_account_id = a.id or t.from_account_id = a.id
group by a.id, a.name, a.type, a.sort_order;
```

### `v_bucket_balances`
Calculates how much is left in each envelope.

```sql
create view v_bucket_balances as
select 
  b.id,
  b.name,
  b.group_id,
  b.target_amount,
  b.sort_order,
  coalesce(sum(case when t.to_bucket_id = b.id then t.amount else 0 end), 0) -
  coalesce(sum(case when t.from_bucket_id = b.id then t.amount else 0 end), 0) as balance
from buckets b
left join transactions t on t.to_bucket_id = b.id or t.from_bucket_id = b.id
group by b.id, b.name, b.group_id, b.target_amount, b.sort_order;
```

### `v_dashboard_summary`
Aggregates everything for the main page load.

```sql
create view v_dashboard_summary as
select
  (select sum(balance) from v_account_balances) as total_cash,
  (select sum(balance) from v_bucket_balances) as total_budgeted,
  (select sum(balance) from v_account_balances) - (select sum(balance) from v_bucket_balances) as unallocated_error_check
;
```

## 5. Security (RLS)
Every table must have Row Level Security enabled.

```sql
alter table accounts enable row level security;
create policy "Users can only see their own accounts"
on accounts for all
using (auth.uid() = user_id);
-- Repeat for all tables
```
