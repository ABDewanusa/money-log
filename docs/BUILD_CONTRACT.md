# BUILD CONTRACT: Money Log MVP

> **STATUS:** DRAFT  
> **ENFORCEMENT:** STRICT

This document serves as the binding agreement for the MVP scope. Any feature not explicitly listed in "MUST DO" is considered out of scope by default. Deviations require explicit written amendment to this contract.

## 1. Core Guarantees
The system **MUST** guarantee the following data integrity rules at all times:
*   **Double Entry Integrity:** Every transaction must have a source and a destination. The sum of all Account balances MUST equal the sum of all Bucket balances (plus any unallocated "To be Budgeted" bucket).
*   **Persistence:** All data (Accounts, Buckets, Transactions) must be persisted to Supabase immediately. No local-only storage for critical data.
*   **Zero-Sum Logic:** Moving money between buckets or accounts must result in a net change of zero to the total system value.

## 2. Hard Constraints
The development **MUST** adhere to these technical boundaries:
*   **Single User Architecture:** The database schema and application logic will assume a single user context per request. `user_id` is required on every table and in every query solely to satisfy Supabase Row Level Security (RLS) policies. Multi-tenancy logic beyond simple data isolation is not required.
*   **Zero Cost:** All infrastructure must run on free tiers (Vercel Hobby, Supabase Free).
*   **No External APIs:** No connection to banking APIs (Plaid, Yodlee, etc.).
*   **Framework:** Next.js (App Router) + Tailwind CSS.
*   **Database:** PostgreSQL via Supabase.

## 3. Explicit Exclusions (The "NO" List)
The MVP **MUST NOT** include:
*   **Bank Syncing:** No automated import of transactions.
*   **Recurring Transactions:** No automated scheduling of future transactions.
*   **Mobile App:** No native iOS/Android app. (Responsive web only).
*   **Data Import/Export:** No CSV import or export features.
*   **Forecasting:** No "future balance" predictions.
*   **Multi-Currency:** USD (or single base currency) only.
*   **Complex Auth Flows:** No "Forgot Password", "Social Login", or "2FA". Simple Email/Password only.
*   **Reports/Charts:** Beyond simple monthly totals, no fancy visualizations.

## 4. Allowed Simplifications
To maximize speed, the following shortcuts are **PERMITTED**:
*   **Seeded Defaults:** Provide sensible default groups, but users can create and map new groups to Core Types.
*   **Minimal Error Handling:** UI can simply alert "Error" on failure; detailed recovery flows are not required.
*   **Basic Validation:** Form validation can be minimal (e.g., just "required" fields).
*   **No "Undo":** Deleting a transaction is permanent. No "Trash" or "Undo" functionality.
*   **No Offline Mode:** The app requires an active internet connection to function.

## 5. MVP Completion Definition
The MVP is considered **DONE** when:
1.  **Deployment:** The app is live on a Vercel URL.
2.  **Auth:** A user can log in.
3.  **Setup:** A user can create at least 2 Accounts, 2 Groups (mapped to Core Types), and 2 Buckets.
4.  **Transaction Flow:**
    *   User can log an Income (Account increases, "To Be Budgeted" increases).
    *   User can log an Expense (Account decreases, Bucket decreases).
    *   User can Transfer (Account A -> Account B).
    *   User can Bucket Move (Bucket A -> Bucket B).
5.  **Verification:** The Dashboard shows the correct total balance across all Accounts and all Buckets, grouped by Core Type, and they match.
6.  **UX:** The "New Transaction" modal works with bottom navigation present and does not obscure actions.
