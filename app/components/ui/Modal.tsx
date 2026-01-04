'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

export default function Modal({ children }: { children: React.ReactNode }) {
  const overlay = useRef(null)
  const wrapper = useRef(null)
  const router = useRouter()

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss()
      }
    },
    [onDismiss, overlay, wrapper]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    },
    [onDismiss]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return (
    <div
      ref={overlay}
      className="fixed z-[60] left-0 right-0 top-0 bottom-0 mx-auto bg-black/60 p-4 flex items-center justify-center backdrop-blur-sm"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-xl pb-[env(safe-area-inset-bottom)]"
      >
        {children}
      </div>
    </div>
  )
}
