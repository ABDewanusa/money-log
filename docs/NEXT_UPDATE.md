# Next Update Cycle v1.2

## 1. Major Refactoring (High Attention Required)
> **CRITICAL:** These changes involve database schema, API endpoints, and extensive UI updates.

1.  **Rename "Bucket" to "Budget":** 
    *   Change all references of `Bucket` to `Budget`.
    *   Affects: Database tables, code variables, UI labels.
2.  **Rename "Groups" to "Categories":** 
    *   Change all references of `Groups` to `Categories`.
    *   Affects: Database tables, code variables, UI labels.

## 2. Navigation & Layout Overhaul
1.  **Settings as Modals (Intercepting Routes):**
    *   Convert Accounts, Categories, and Budgets settings into independent pages that open as modals (similar to `transactions/new`).
    *   Remove the global "Settings" navigation tabs.
2.  **Dashboard "Manage" Buttons:**
    *   Add a "Manage" button to each section (Accounts, Categories, Budgets) on the Dashboard.
    *   These buttons trigger the respective Settings Modals.

## 3. Transaction & Budgeting Enhancements
1.  **Transaction List:**
    *   Add missing **"Budgeting"** tab (for budget moves/allocations).
2.  **New Transaction Defaults:**
    *   **Income:** Default "To Account" -> "To be Budgeted" (requires new system bucket/logic).
    *   **Budget Move:** Default "From Bucket" -> "To be Budgeted".
3.  **Specialized Action Modals:**
    *   Create dedicated forms for specific contexts (alongside the unified modal):
        *   **Accounts Context:** specialized forms for *Income* and *Transfer*.
        *   **Budget Context:** specialized forms for *Expense* and *Budget Move*.
        *   **Expense Context:** A **list-like multi-entry form** for rapid entry of multiple expenses.
4.  **Contextual (+) Buttons:**
    *   Add specialized (+) buttons to each dashboard section that open the relevant specialized modal.

## 4. Previous Planned Areas
1.  **Stability and Polish:** Ensure consistent experience.
2.  **Future Ideas:** Richer charts, Export options (CSV/PDF).
