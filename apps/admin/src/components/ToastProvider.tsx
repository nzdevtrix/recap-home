"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Import Toast component
import { Button } from "@/components/ui/button"

// We need to create our own toast component since we're building it from scratch
// Let's create a simple toast implementation

import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

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

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  React.useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timers = toasts.map((toast) =>
      setTimeout(() => dismissToast(toast.id), 5000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg shadow-lg animate-in slide-in-from-bottom-2",
              toast.type === 'success' && 'bg-green-50 border border-green-200',
              toast.type === 'error' && 'bg-red-50 border border-red-200',
              toast.type === 'warning' && 'bg-yellow-50 border border-yellow-200',
              toast.type === 'info' && 'bg-blue-50 border border-blue-200'
            )}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {toast.type === 'error' && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {toast.type === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              {toast.type === 'info' && (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              {toast.title && (
                <h4 className="font-medium text-sm">{toast.title}</h4>
              )}
              <p className="text-sm mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
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

export { ToastProviderComponent as ToastProvider }
