'use client'

import { useFormStatus } from 'react-dom'
import { ReactNode } from 'react'

interface SubmitButtonProps {
  children: ReactNode
  pendingText?: string
  className?: string
}

export default function SubmitButton({ 
  children, 
  pendingText = 'Saving...', 
  className 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={className || "w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {pending ? pendingText : children}
    </button>
  )
}
