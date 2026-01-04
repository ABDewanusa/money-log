'use client'

import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../ui/ThemeToggle'
import { signout } from '@/app/login/actions'
import { LogOut } from 'lucide-react'

export function TopNavigation({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <div className="flex flex-col">
          <div className="font-bold text-xl tracking-tight dark:text-white leading-none">
            Money-Log
          </div>
          {userEmail && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {userEmail}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signout}>
            <button 
              type="submit"
              className="p-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-red-600 dark:text-red-400"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
