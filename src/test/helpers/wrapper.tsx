import React, { type ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/ToastProvider'

export function createToastWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>
  }
}
