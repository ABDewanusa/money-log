# Styling Philosophy & Dark Mode Guidelines

This document outlines the styling standards for the Money Log application, ensuring a consistent user experience across Light and Dark modes.

## Core Principles

1.  **Uniformity**: Similar elements (lists, forms, buttons) must look identical across different pages (Dashboard, Settings, Transactions).
2.  **Dark Mode First**: All components must support Dark Mode natively using Tailwind's `dark:` modifier.
3.  **Visual Hierarchy**: Use borders and dividers to group related content, rather than relying solely on spacing.

## Color Palette & Tokens

### Backgrounds
-   **Page Background**: Default (White/Slate-900 implied by global layout).
-   **Card / Section Container**: `bg-white dark:bg-slate-800`
-   **Inner Form Container**: `bg-gray-50 dark:bg-slate-700/50` (Used to group related form inputs).
-   **Input Fields**: `bg-white dark:bg-slate-900`

### Borders & Dividers
-   **Card Borders**: `border-gray-200 dark:border-slate-700`
-   **Inner Dividers**: `divide-gray-200 dark:divide-slate-700`
-   **Input Borders**: `border-gray-300 dark:border-slate-600`

### Text
-   **Primary Text**: `text-gray-900 dark:text-gray-100` or `dark:text-white`
-   **Secondary Text**: `text-gray-500 dark:text-gray-400`
-   **Labels**: `text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide`

### Buttons
-   **Primary Action** (Forms):
    -   Light: `bg-black text-white hover:bg-gray-800`
    -   Dark: `bg-white text-black hover:bg-gray-200`
    -   Structure: `w-full py-3 px-4 rounded-lg font-medium` (Block style)
-   **List Action Buttons** (Archive/Delete/Edit):
    -   **Size**: Fixed width `w-20` (80px) for uniform alignment.
    -   **Style**: Colored outlines/backgrounds (Red/Orange/Blue) with `bg-opacity` for subtle look.
    -   **Responsive Layout**:
        -   **Mobile**: Stacked vertically (`flex-col`), aligned to the right or end.
        -   **Desktop**: Inline (`flex-row`), aligned with text.
-   **Inline Edit Buttons** (Save/Cancel):
    -   **Context**: Used for quick edits within a list item (e.g., editing bucket target).
    -   **Style**: Small text-only or minimal buttons (`text-xs`).
    -   **Save**: `text-green-600 hover:text-green-700 dark:text-green-400`
    -   **Cancel**: `text-red-600 hover:text-red-700 dark:text-red-400`

### Navigation
-   **Bottom Navigation**:
    -   **Position**: Fixed at bottom (`fixed bottom-0`).
    -   **Height**: `h-16` with safe area padding (`pb-[env(safe-area-inset-bottom)]`).
    -   **Styling**: `bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800`.
    -   **Active State**: `text-black dark:text-white`, icon stroke width increases.
    -   **Inactive State**: `text-gray-500 dark:text-gray-400`.
    -   **Modal Interaction**: Ensure modal overlay uses a higher z-index than bottom nav (e.g., `z-[60]`) and modal content adds bottom safe-area padding.

## Component Patterns

### 1. Lists (Accounts, Buckets)
Instead of floating individual cards, use **Grouped Lists**:
-   **Container**: `bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-slate-700`
-   **Items**: `p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4` (Always row layout for main container to keep text left and buttons right).
-   **Action Buttons Container**: `flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0`.
-   **Button Size Enforcement**: Buttons must have `flex-shrink-0` to prevent width collapse on mobile.

### 2. Forms
-   Wrap logical groups of inputs in an **Inner Container** (`bg-gray-50 dark:bg-slate-700/50`).
-   Inputs should have `dark:bg-slate-900` to contrast with the inner container.
-   Submit buttons should be full width (`w-full`).

### 3. Dashboard
-   **Header**: `border-b border-gray-200 dark:border-slate-700`
-   **Summary Cards**: Standalone cards (`bg-white dark:bg-slate-800`).
 -   **Recent Activity**: Transactions list styled as a compact card within the dashboard.

### 4. Modals
-   **Overlay**: Semi-transparent black with blur (`bg-black/60 backdrop-blur-sm`), z-index above navigation.
-   **Content**: Constrained width (`max-w-lg`) and height (`max-h-[90vh]`), scrollable (`overflow-y-auto`), rounded corners.
-   **Safe Area**: Add `pb-[env(safe-area-inset-bottom)]` to avoid obscuring submit buttons on devices with bottom insets.
