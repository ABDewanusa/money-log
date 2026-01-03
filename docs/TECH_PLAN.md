# TECH PLAN: Money Log MVP

## 1. Architecture Overview
*   **Framework:** Next.js 14+ (App Router)
*   **Database:** Supabase (PostgreSQL)
*   **Styling:** Tailwind CSS
*   **Deployment:** Vercel (Zero-config)
*   **Pattern:** Server Components for read, Server Actions for write. No API routes needed.

## 2. Frontend Structure (App Router)
All routes protected by middleware except public landing.

```
/app
  /login              # Public: Auth entry point
  /dashboard          # Private: Main view (Groups/Buckets/Accounts summary)
  /transactions       # Private: List view
    /new              # Private: Dedicated "Add Transaction" page
  /settings           # Private: CRUD for Accounts & Buckets (Create/Archive/Delete)
  layout.tsx          # Global Shell (Nav, Auth check)
  page.tsx            # Redirects to /dashboard or /login
```

**Key Components:**
*   `TransactionForm`: The most critical component. Optimized for mobile touch.
*   `BalanceCard`: Display for Account/Bucket balances.
*   `GroupSection`: Collapsible/Organized view for Budget Groups.
*   `AccountList`: List of accounts with balances.

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
*   `createBucket`, `archiveBucket`, `unarchiveBucket`, `deleteBucket`
*   `seedUserData()`: Called on first login. Creates default structure.

## 4. Data Flow

**Read (Page Load):**
1.  User requests `/dashboard`.
2.  **Server Component** calls `supabase.from('v_dashboard_summary').select('*')` (and fetches lists of accounts/buckets).
3.  HTML rendered on server with latest data.
4.  Sent to client (Zero client-side fetch waterfall).

**Write (User Action):**
1.  User submits `<form action={logTransaction}>`.
2.  **Server Action** runs on Vercel.
3.  Validates data (Zod).
4.  Inserts into `transactions` table.
5.  Calls `revalidatePath('/dashboard')`.
6.  Next.js sends back updated HTML for the page.
7.  UI updates immediately.

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
*   **UI State:** minimal `useState` for things like "isModalOpen" or form inputs.
*   **URL State:** Use URL Search Params for filters (e.g., `?month=2024-01`).

## 7. Deployment Flow
1.  **Local:** `npm run dev` (Connects to Supabase Dev project).
2.  **Git:** Push to `main`.
3.  **Vercel:** Auto-detects Next.js, builds, deploys.
4.  **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel.

## 8. Known Technical Tradeoffs
*   **Latency:** Every interaction requires a round-trip to the server (no optimistic UI for MVP to save complexity).
*   **Offline:** App will not work without internet.
*   **Hard Reloads:** Data updates might feel "jumpy" without optimistic updates, but guarantees accuracy.
*   **Constraint:** "Buckets" logic relies on strict entry. If a user creates a transaction without a bucket (where required), the math breaks. Database constraints must enforce this.
