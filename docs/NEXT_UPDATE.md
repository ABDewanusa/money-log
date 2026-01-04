# v1.1 Updates Summary

This document reflects the current state of implemented features and clarifies what’s next, based on user feedback.

## 1. Reporting & Analytics (Akumulasi Data) — Implemented

**User Feedback:**
> "akumulasi pengeluaran dan pemasukan 1 bulan berapa" (Monthly totals)
> "akumulasi pengeluaran pertahun berapa" (Yearly totals)

**Context:**
The current MVP Dashboard focuses on *current balances* (Snapshots). Users need historical context to understand their spending habits over time.

**Implemented:**
* Monthly Report Card with Income, Expenses, Net Savings
* Breakdown aggregated by Core Type (need/want/savings)
* Yearly overview totals
* New `/reports` route with server-side aggregation

## 2. Enhanced Categorization (Flexible Groups with Philosophy) — Implemented

**User Feedback:**
> "what about making CRUD for sub categories, while still enforcing Needs, Wants, Saving philosophy"

**Context:**
Users want to organize their budget into more specific categories (e.g., "Food", "Transport", "Urgent") rather than just one giant "Needs" list. However, they still want to track how much they are spending on Needs vs. Wants overall.

**Implemented:**
* Custom Groups require a Core Type: `need | want | savings`
* Dashboard budget grouped by Core Type (philosophy)
* Reports aggregated by Core Type
* Group creation form includes Core Type selection

**Example Hierarchy:**
*   **Philosophy (Core Type):** NEEDS
    *   **Group (User Defined):** Food
        *   *Bucket:* Groceries
        *   *Bucket:* Work Lunch
    *   **Group (User Defined):** Housing
        *   *Bucket:* Rent
        *   *Bucket:* Utilities
*   **Philosophy (Core Type):** WANTS
    *   **Group (User Defined):** Fun
        *   *Bucket:* Movies

## 3. UX Enhancements — Implemented

**User Feedback:**
> "adding tabs on transactions page separating different type of transaction, and All if want to"
> "adding snippets of some latest expenses transactions"

**Implemented:**
* Transaction tabs on `/transactions`: `All | Income | Expense | Transfers`
* Recent Activity widget on Dashboard (last 5 transactions)
* Transaction Modal via Intercepting Route: `app/@modal/(.)transactions/new/page.tsx`

## 4. Known Issues & Bugs — Resolved

**User Feedback:**
> "when I add an account it doesnt show the changes immediately, isnt next.js should be reactive as it is basically react."

**Context:**
The current implementation uses Server Actions without **Optimistic UI**.
*   **Current Behavior:** User clicks "Add" -> Request goes to Server -> Database Insert -> Server Re-renders -> Client Updates. (This round-trip causes a delay).
*   **Expected Behavior:** User clicks "Add" -> UI updates *instantly* -> Background request syncs with Server.

**Fixes:**
* Optimistic UI in Accounts/Buckets/Groups lists
* Loading states for forms (Submit button; manual state for TransactionForm)
* Hydration mismatch from ARIA ids fixed by unique `DndContext` ids
* TypeScript errors addressed in Dashboard and Reports

## 5. Action Plan

1. Stability and polish across settings and dashboard
2. Small UX refinements based on ongoing feedback
3. Future ideas: richer charts and export options (CSV/PDF)
