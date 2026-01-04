'use client'

import { useRouter } from 'next/navigation'
import TransactionForm from './TransactionForm'
import { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof TransactionForm>, 'onSuccess'>

export default function ModalTransactionForm(props: Props) {
  const router = useRouter()

  return (
    <TransactionForm 
      {...props} 
      onSuccess={() => {
        router.back()
        router.refresh()
      }} 
    />
  )
}
