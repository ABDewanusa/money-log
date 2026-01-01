'use client'

import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Money Log</h1>
        <p className="text-gray-500">Sign in to track your finances.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm w-full max-w-sm text-center">
          {error}
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

        <div className="flex flex-col gap-2 mt-4">
          <button formAction={login} className="bg-black text-white p-2 rounded hover:bg-gray-800">
            Log In
          </button>
          <button formAction={signup} className="bg-white text-black border p-2 rounded hover:bg-gray-50">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}
