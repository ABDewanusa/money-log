'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ScrollText, Settings, BarChart3 } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  const tabs = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      isActive: (path: string) => path === '/dashboard' || path === '/'
    },
    { 
      name: 'Transactions', 
      href: '/transactions', 
      icon: ScrollText,
      isActive: (path: string) => path.startsWith('/transactions')
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      isActive: (path: string) => path.startsWith('/reports')
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      isActive: (path: string) => path.startsWith('/settings')
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-50">
      <div className="max-w-7xl mx-auto flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.isActive(pathname)
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                active 
                  ? 'text-black dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
