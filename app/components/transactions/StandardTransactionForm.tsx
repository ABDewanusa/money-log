'use client'

import { useRouter } from 'next/navigation'
import TransactionForm from './TransactionForm'
import { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof TransactionForm>, 'onSuccess'>

export default function StandardTransactionForm(props: Props) {
  const router = useRouter()

  return (
    <TransactionForm 
      {...props} 
      onSuccess={() => {
        router.push('/transactions')
        router.refresh()
      }} 
    />
  )
}
