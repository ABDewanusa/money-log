Money Log is a personal finance tracker built with Next.js (App Router) and Supabase. It helps you manage accounts, budget buckets, and groups mapped to core financial philosophies (Needs, Wants, Savings). It features drag-and-drop sorting, optimistic updates, a fast transaction modal, and useful reports.

## Features

- Accounts: add/edit/archive, drag-and-drop sort, optimistic UI updates
- Groups: user-defined groups with a required Core Type (need, want, savings), drag-and-drop sort
- Buckets: add/edit target amount and group, archive/unarchive, drag-and-drop within groups
- Dashboard: budgets grouped by Core Type; includes Recent Activity widget and account balances
- Transactions: filter tabs (All | Income | Expense | Transfers); “New Transaction” runs in a modal
- Reports: monthly and yearly stats; expenses aggregated by Core Type
- Theming: light/dark mode with persisted preference

## Architecture

- App Router with server actions for mutations
- Optimistic UI using React’s `useOptimistic` in settings lists
- Drag-and-drop lists using `@dnd-kit`
- Intercepting Route modal for fast transaction entry
- Components grouped by feature:
  - `app/components/dashboard`
  - `app/components/settings`
  - `app/components/transactions`
  - `app/components/layout`
  - `app/components/ui`
  - `app/components/providers`

Key components:
- Dashboard: `AccountList`, `BalanceCard`, `GroupSection`
- Settings: `AccountsSettings` → `SortableAccountList`, `GroupsSettings` → `SortableGroupList`, `BucketsSettings` → `SortableBucketList`
- Transactions: `TransactionForm` with `ModalTransactionForm` and `StandardTransactionForm` wrappers
- Layout/UI: `TopNavigation`, `BottomNavigation`, `ThemeToggle`, `Modal`, `SubmitButton`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Transaction Modal
- Navigating to `/transactions/new` directly loads the full page.
- Clicking “New Transaction” from other pages uses an Intercepting Route to open a modal without leaving context.
- The modal can be closed with ESC or backdrop click and returns you to the previous page.

## Environment Variables

This project uses Supabase. You must create a `.env.local` file in the root directory with the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in your Supabase Project Settings -> API.

## Notes

- Hydration mismatch from ARIA ids in drag-and-drop was resolved by assigning unique `id` to each `DndContext`.
- Reports and Dashboard aggregate by Core Type (need/want/savings) while still supporting custom groups.
- The settings pages use optimistic updates for a snappy experience.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
