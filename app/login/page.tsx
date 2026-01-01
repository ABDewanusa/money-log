'use client'

import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButtons() {
  const { pending } = useFormStatus()
  
  return (
    <div className="flex flex-col gap-2 mt-4">
      <button 
        type="submit" 
        formAction={login} 
        disabled={pending}
        className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {pending ? 'Processing...' : 'Log In'}
      </button>
      <button 
        type="submit" 
        formAction={signup} 
        disabled={pending}
        className="bg-white text-black border p-2 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        Sign Up
      </button>
    </div>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Money Log</h1>
        <p className="text-gray-500">Sign in to track your finances.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm w-full max-w-sm text-center">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 text-green-600 p-3 rounded text-sm w-full max-w-sm text-center">
          {message}
        </div>
      )}

      <form className="flex flex-col w-full max-w-sm gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border p-2 rounded"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border p-2 rounded"
            placeholder="••••••••"
          />
        </div>

        <SubmitButtons />
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
