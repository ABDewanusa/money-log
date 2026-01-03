# Product Requirements Document (PRD): Money Log MVP

## 1. Problem Statement
Personal finance management is often fragmented between overly complex automated apps (Mint, YNAB) that force specific workflows and manual spreadsheets that are flexible but brittle and hard to maintain on mobile/web. Users need a "middle path": a structured, manual-entry system that enforces zero-based budgeting principles without the overhead of bank syncing or proprietary algorithms.

## 2. Target User
- **The "Recovering Spreadsheet User":** Someone who likes control and manual tracking but wants a better UI/UX than Excel/Google Sheets.
- **Solo Founder / Freelancer:** Needs to track personal runway and expenses closely.
- **Privacy Conscious:** Does not want to link bank credentials to 3rd party services.

## 3. Goals & Success Metrics
**Goals:**
1.  Provide a unified view of "Where is my money?" (Accounts) and "What is it for?" (Buckets).
2.  Enable rapid manual transaction entry (< 10 seconds).
3.  Ensure 100% accuracy in accounting (Double-entry principle under the hood, simplified for UI).

**Success Metrics:**
-   **Core Loop:** User logs a transaction successfully.
-   **Retention:** User returns to log transactions at least 3 times a week.
-   **Integrity:** Sum of Accounts == Sum of Buckets (always).

## 4. MVP Scope

### IN Scope
-   **Authentication:** Email/Password (Supabase Auth).
-   **Dashboard:** High-level summary of Groups (Needs, Wants, Future) and Account Balances.
-   **Account Management:** Create, Archive, Unarchive, Delete (Soft) Accounts.
-   **Bucket Management:** Create, Update Targets, Archive, Unarchive, Delete (Soft) Buckets within Groups.
-   **Transaction Management:**
    -   Log Income (To Account, To Bucket).
    -   Log Expense (From Account, From Bucket).
    -   Transfer (Account to Account).
    -   Bucket Move (Bucket to Bucket).
-   **Simple Reporting:** Monthly spending by Group/Bucket.

### OUT Scope (Post-MVP)
-   Bank integration (Plaid/Teller).
-   Mobile Native App (PWA is sufficient).
-   Recurring transactions (Manual entry for now).
-   Multi-user/Family sharing.
-   Forecasting/Trends.
-   Import/Export (CSV).

## 5. Core Features

### 5.1 Data Structure (The "Envelope" Model)
*   **Groups:** High-level strategy containers.
    *   *Examples:* "Monthly Fixed", "Day-to-Day", "Sinking Funds", "Investments".
*   **Buckets:** The actual budget containers.
    *   *Examples:* "Rent", "Groceries", "Car Repair Fund".
    *   *Properties:* Name, Target Amount (optional).
*   **Accounts:** Physical locations of money.
    *   *Examples:* "Checking", "Wallet", "Savings", "Credit Card".
*   **Transactions:** The atomic unit of change.

### 5.2 Transaction Types
1.  **Income:** Increases an Account balance AND a Bucket balance (e.g., "To be Budgeted").
2.  **Expense:** Decreases an Account balance AND a Bucket balance.
3.  **Transfer:** Moves money between Accounts (e.g., Checking -> Savings). *Net worth unchanged.*
4.  **Bucket Move:** Moves money between Buckets (e.g., Vacation -> Car Repair). *Account balances unchanged.*

## 6. Non-Goals
-   We are NOT building an automated expense tracker. Manual entry is a feature, not a bug (encourages mindfulness).
-   We are NOT building an investment portfolio tracker.
-   We are NOT building a bill reminder system.

## 7. UX Principles
1.  **Speed over Flash:** Transaction entry form should load instantly.
2.  **Trust but Verify:** Always show the "To Be Budgeted" balance. The system must ensure Sum(Accounts) == Sum(Buckets) at all times.
3.  **Mobile First (Web):** The UI must work perfectly on a mobile browser for on-the-go entry.
4.  **No Click Fatigue:** minimizing clicks to log a standard expense.

## 8. Release Criteria
1.  User can sign up and log in.
2.  User can set up initial accounts and balances.
3.  User can create budget buckets.
4.  User can log an expense and see balances update immediately.
5.  Database constraints prevent negative balances where impossible (logic checks).
6.  Deployed to Vercel with Supabase backend connected.
