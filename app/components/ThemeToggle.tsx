"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
        <span className="sr-only">Toggle theme</span>
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "light" ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  )
}
