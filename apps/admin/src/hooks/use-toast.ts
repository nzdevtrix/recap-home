"use client"

import { createContext, useContext } from "react"

interface ToastMessage {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Simple toast hook for easy usage
export function useSimpleToast() {
  const { addToast } = useToast()

  const success = (message: string, title?: string) =>
    addToast({ type: 'success', message, title })

  const error = (message: string, title?: string) =>
    addToast({ type: 'error', message, title })

  const warning = (message: string, title?: string) =>
    addToast({ type: 'warning', message, title })

  const info = (message: string, title?: string) =>
    addToast({ type: 'info', message, title })

  return { success, error, warning, info }
}

export { ToastContext }
