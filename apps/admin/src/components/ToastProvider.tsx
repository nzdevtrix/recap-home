'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast { id: string; title: string; description?: string; variant?: 'default' | 'destructive' }
interface ToastContextType { toast: (t: Omit<Toast, 'id'>) => void }
const ToastContext = createContext<ToastContextType>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

export function ToastProviderComponent({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
  }, [])
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm ${t.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
            <p className="font-semibold">{t.title}</p>
            {t.description && <p className="text-xs opacity-80 mt-1">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
