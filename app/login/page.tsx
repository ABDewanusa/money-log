'use client'

import { login, signup, loginWithGoogle } from './actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useFormStatus } from 'react-dom'
import { ThemeToggle } from '@/app/components/ThemeToggle'

function SubmitButtons() {
  const { pending } = useFormStatus()
  
  return (
    <div className="flex flex-col gap-3 mt-6">
      <button 
        type="submit" 
        formAction={login} 
        disabled={pending}
        className="w-full py-3 px-4 bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-bold rounded-lg shadow-sm transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Processing...' : 'Log In'}
      </button>
      <button 
        type="submit" 
        formAction={signup} 
        disabled={pending}
        className="w-full py-3 px-4 bg-transparent border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold rounded-lg transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sign Up
      </button>
    </div>
  )
}

function GoogleButton() {
  return (
    <form action={loginWithGoogle}>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold rounded-lg transition-all flex justify-center items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </form>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Money Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to track your finances.</p>
        </div>
        <ThemeToggle />
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-md text-sm border border-green-200 dark:border-green-800">
          {message}
        </div>
      )}

      <form className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
          />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all dark:bg-slate-900"
          />
        </div>

        <SubmitButtons />
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleButton />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
