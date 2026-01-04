# TECH PLAN: Money Log MVP

## 1. Architecture Overview
*   **Framework:** Next.js (App Router)
*   **Database:** Supabase (PostgreSQL)
*   **Styling:** Tailwind CSS
*   **Deployment:** Vercel (Zero-config)
*   **Pattern:** Server Components for read, Server Actions for write. Intercepting Route modal for fast entry.
*   **Proxy:** Uses `proxy.ts` (formerly middleware) for auth redirects.

## 2. Frontend Structure (App Router)
All routes protected by middleware except public landing.

```
/app
  /login                  # Public: Auth entry point
  /dashboard              # Private: Main view (Core Type grouping + balances)
  /transactions           # Private: List view with filter tabs
    /new                  # Private: Full page entry route
  /@modal/(.)transactions/new  # Intercepting Route modal
  /reports                # Private: Monthly/Yearly stats
  /settings               # Private: CRUD for Accounts, Groups, Buckets
  /components
    /dashboard
    /settings
    /transactions
    /layout
    /ui
    /providers
  layout.tsx              # Global Shell (Top/Bottom nav, ThemeProvider)
  page.tsx                # Redirects to /dashboard or /login
```

**Key Components:**
*   `BottomNavigation`: Fixed footer with tabs (Dashboard, Transactions, Settings).
*   `TransactionForm`: Critical component. Optimized for mobile touch; used in modal and full page.
*   `BalanceCard`: Display for Account/Bucket balances.
*   `GroupSection`: Organized view for budgets grouped by Core Type.
*   `AccountList`: List of accounts with balances.
*   `SubmitButton`: Uses form status; manual state in complex forms.

## 3. Backend Structure (Supabase)

### 3.1 Tables
*   **`users`**: Handled by Supabase Auth (`auth.users`).
*   **`accounts`**:
    *   `id`, `user_id`, `name`, `type` (checking, savings, credit), `created_at`
*   **`groups`**: (High level budget categories)
    *   `id`, `user_id`, `title`, `order`
*   **`buckets`**:
    *   `id`, `user_id`, `group_id`, `name`, `target_amount`, `is_archived`
*   **`transactions`**: (Single Source of Truth)
    *   `id`, `user_id`, `date`, `amount` (bigint, cents), `payee`, `description`
    *   `type`: ENUM ('income', 'expense', 'transfer', 'bucket_move')
    *   `from_account_id` (nullable)
    *   `to_account_id` (nullable)
    *   `from_bucket_id` (nullable)
    *   `to_bucket_id` (nullable)

### 3.2 SQL Views (Derived Data)
Instead of calculating balances in JS, we use Postgres Views for performance and consistency.

*   **`v_account_balances`**: Sum of all inflows minus outflows per account.
*   **`v_bucket_balances`**: Sum of all inflows minus outflows per bucket.

### 3.3 Server Actions (`/app/actions`)
*   `logTransaction(formData)`: Validates input, inserts to DB, revalidates cache.
*   `deleteTransaction(formData)`: Deletes a transaction.
*   `createAccount`, `archiveAccount`, `unarchiveAccount`, `deleteAccount`
*   `createGroup`, `updateGroup`, `deleteGroup`
*   `createBucket`, `updateBucket`, `archiveBucket`, `unarchiveBucket`, `deleteBucket`
*   `seedUserData()`: Called on first login. Creates default structure.

## 4. Data Flow

**Read (Page Load):**
1.  User requests `/dashboard`.
2.  **Server Component** fetches `getGroups`, `getBucketBalances`, `getAccountBalances` in parallel.
3.  Calculates summary totals (Cash vs Budgeted) in the application layer.
4.  HTML rendered on server with latest data.
5.  Sent to client (Zero client-side fetch waterfall).

**Write (User Action):**
1.  User submits `<form>` in modal or page.
2.  **Server Action** runs on Vercel.
3.  Validates data (Zod).
4.  Inserts into `transactions` table.
5.  Revalidation and refresh.
6.  Optimistic UI where applicable (settings lists).

## 5. Styling / UI Approach
*   **Library:** Tailwind CSS (standard).
*   **Component Set:** Minimal. Hand-rolled or copy-paste from Shadcn/UI (Button, Input, Card) to save time.
*   **Mobile Optimization:**
    *   Inputs: `inputmode="decimal"` for amount.
    *   Touch targets: Minimum 44px.
    *   Layout: Single column on mobile, Grid on desktop.

## 6. State Management Strategy
*   **Global Store:** **NONE**. Do not use Redux, Zustand, or Context for data.
*   **Server State:** Handled by Next.js Cache & Revalidation.
*   **UI State:** Minimal `useState` for form inputs; `useOptimistic` for list mutations.
*   **URL State:** Use URL Search Params for filters (e.g., `?type=expense`, `?month=2024-01`).

## 7. Deployment Flow
1.  **Local:** `npm run dev` (Connects to Supabase Dev project).
2.  **Git:** Push to `main`.
3.  **Vercel:** Auto-detects Next.js, builds, deploys.
4.  **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel.

## 8. Known Technical Tradeoffs
*   **Latency:** Server actions round-trip remains, mitigated by optimistic UI for settings lists.
*   **Offline:** App will not work without internet.
*   **Hard Reloads:** Reduced by modal and optimistic updates, but some flows still revalidate.
*   **Constraint:** "Buckets" logic relies on strict entry. If a user creates a transaction without a bucket (where required), the math breaks. Database constraints must enforce this.
